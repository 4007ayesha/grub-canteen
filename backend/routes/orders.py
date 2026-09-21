import random
import string
from decimal import Decimal

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import (
    Order,
    OrderItem,
    Payment,
    MenuItem,
    Inventory,
)
from backend.schemas import OrderCreate, OrderOut
from backend.dependencies import get_current_user
from backend.websocket_manager import manager
from backend.routes.notifications import create_notification


router = APIRouter(
    prefix="/orders",
    tags=["orders"],
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def generate_token():
    """
    Generates a token such as T4821.
    """
    return "T" + "".join(
        random.choices(
            string.digits,
            k=4,
        )
    )


def order_response(
    order,
):
    """
    Converts an Order object into the response format.
    Payment information is stored directly on the Order.
    """
    return {
        "id": order.id,
        "token_number": order.token_number,
        "status": order.status,
        "total_amount": order.total_amount,
        "items": order.items,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
    }


def load_order(
    db: Session,
    order_id: int,
):
    """
    Loads an order together with its order items.
    """
    return (
        db.query(Order)
        .options(
            joinedload(Order.items)
        )
        .filter(
            Order.id == order_id
        )
        .first()
    )


# ============================================================
# CREATE ORDER
# ============================================================

@router.post(
    "/",
    response_model=OrderOut,
)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    user_id = int(user["sub"])

    try:
        # ----------------------------------------------------
        # Validate order items
        # ----------------------------------------------------

        if not order.items:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Order must contain "
                    "at least one item"
                ),
            )

        # Prevent duplicate menu items.
        menu_item_ids = [
            item.menu_item_id
            for item in order.items
        ]

        if len(menu_item_ids) != len(
            set(menu_item_ids)
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "The same menu item cannot "
                    "be added more than once. "
                    "Update its quantity instead."
                ),
            )

        # ----------------------------------------------------
        # Validate payment
        # ----------------------------------------------------

        payment = (
            db.query(Payment)
            .filter(
                Payment.id == order.payment_id
            )
            .first()
        )

        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Payment not found",
            )

        # Check payment ownership only if
        # the Payment model contains user_id.
        payment_user_id = getattr(
            payment,
            "user_id",
            None,
        )

        if (
            payment_user_id is not None
            and int(payment_user_id) != user_id
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not authorized "
                    "to use this payment"
                ),
            )

        payment_method = (
            payment.method.lower()
            if payment.method
            else ""
        )

        payment_status = (
            payment.status.lower()
            if payment.status
            else ""
        )

        # Online payments must be successful.
        # Cash payments can remain pending.
        if (
            payment_method != "cash"
            and payment_status != "success"
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Online payment must be "
                    "successful before creating "
                    "an order"
                ),
            )

        # ----------------------------------------------------
        # Validate menu items and stock
        # ----------------------------------------------------

        inventory_records = []

        calculated_total = Decimal(
            "0.00"
        )

        for item in order.items:

            if item.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Quantity must be "
                        "greater than zero"
                    ),
                )

            menu_item = (
                db.query(MenuItem)
                .filter(
                    MenuItem.id
                    == item.menu_item_id
                )
                .first()
            )

            if not menu_item:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Menu item "
                        f"{item.menu_item_id} "
                        "not found"
                    ),
                )

            if not menu_item.available:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"{menu_item.name} "
                        "is currently unavailable"
                    ),
                )

            inventory = (
                db.query(Inventory)
                .filter(
                    Inventory.menu_item_id
                    == item.menu_item_id
                )
                .first()
            )

            if not inventory:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock not configured "
                        f"for {menu_item.name}"
                    ),
                )

            if (
                inventory.current_stock
                < item.quantity
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Not enough stock for "
                        f"{menu_item.name}. "
                        f"Available stock: "
                        f"{inventory.current_stock}"
                    ),
                )

            # Use the actual price from the database.
            actual_price = Decimal(
                str(menu_item.price)
            )

            calculated_total += (
                actual_price * item.quantity
            )

            inventory_records.append(
                {
                    "inventory": inventory,
                    "menu_item": menu_item,
                    "quantity": item.quantity,
                    "price": actual_price,
                }
            )

        # ----------------------------------------------------
        # Create order
        # ----------------------------------------------------

        new_order = Order(
            user_id=user_id,
            token_number=generate_token(),
            total_amount=calculated_total,
            payment_method=payment.method,
            payment_status=payment.status,
        )

        db.add(new_order)
        db.flush()

        # ----------------------------------------------------
        # Create order items
        # ----------------------------------------------------

        for record in inventory_records:

            menu_item = record["menu_item"]

            order_item = OrderItem(
                order_id=new_order.id,
                menu_item_id=menu_item.id,
                quantity=record["quantity"],
                price_at_order=record["price"],
            )

            db.add(order_item)

        # ----------------------------------------------------
        # Deduct stock
        # ----------------------------------------------------

        for record in inventory_records:

            inventory = record["inventory"]
            menu_item = record["menu_item"]
            quantity = record["quantity"]

            inventory.current_stock -= quantity

            # If stock becomes zero,
            # mark the menu item unavailable.
            if inventory.current_stock == 0:
                menu_item.available = False

        # ----------------------------------------------------
        # Save order
        # ----------------------------------------------------

        db.commit()

        saved_order = (
            db.query(Order)
            .options(
                joinedload(Order.items)
            )
            .filter(
                Order.id == new_order.id
            )
            .first()
        )

        return order_response(
            saved_order,
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        print(
            "Error while creating order:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create order",
        )


# ============================================================
# GET MY ORDERS
# ============================================================

@router.get(
    "/my",
    response_model=list[OrderOut],
)
def my_orders(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    user_id = int(user["sub"])

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items)
        )
        .filter(
            Order.user_id == user_id
        )
        .order_by(
            Order.id.desc()
        )
        .all()
    )

    return [
        order_response(order)
        for order in orders
    ]


# ============================================================
# ADMIN VIEW / FILTER ORDERS
# ============================================================

@router.get(
    "/admin/all",
    response_model=list[OrderOut],
)
def admin_all_orders(
    status: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only",
        )

    query = (
        db.query(Order)
        .options(
            joinedload(Order.items)
        )
        .order_by(
            Order.created_at.desc()
        )
    )

    if status:
        query = query.filter(
            Order.status == status
        )

    orders = query.all()

    return [
        order_response(order)
        for order in orders
    ]


# ============================================================
# GET SINGLE ORDER
# ============================================================

@router.get(
    "/{order_id}",
    response_model=OrderOut,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = load_order(
        db,
        order_id,
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    user_id = int(user["sub"])

    if (
        user["role"] != "admin"
        and order.user_id != user_id
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Not authorized to view "
                "this order"
            ),
        )

    return order_response(order)


# ============================================================
# WEBSOCKET ORDER TRACKING
# ============================================================

@router.websocket(
    "/ws/{order_id}"
)
async def order_status_socket(
    websocket: WebSocket,
    order_id: int,
):
    await manager.connect(
        order_id,
        websocket,
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(
            order_id,
            websocket,
        )


# ============================================================
# ADMIN STATUS UPDATE
# ============================================================

@router.put(
    "/{order_id}/status"
)
async def update_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only",
        )

    valid_statuses = [
        "received",
        "preparing",
        "ready",
        "collected",
    ]

    status = status.lower().strip()

    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    status_flow = {
        "received": [
            "preparing",
        ],
        "preparing": [
            "ready",
        ],
        "ready": [
            "collected",
        ],
        "collected": [],
    }

    old_status = order.status

    if status not in status_flow.get(
        old_status,
        [],
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid status transition: "
                f"{old_status} -> {status}"
            ),
        )

    try:
        order.status = status

        db.commit()

        status_messages = {
            "preparing": (
                "Your order is being prepared 👨‍🍳"
            ),
            "ready": (
                "Your order is ready "
                "for pickup! 🎉"
            ),
            "collected": (
                "Order collected. "
                "Enjoy your meal!"
            ),
        }

        if status in status_messages:
            create_notification(
                db,
                order.user_id,
                status_messages[status],
            )

        await manager.broadcast(
            order_id,
            {
                "order_id": order_id,
                "status": status,
            },
        )

        return {
            "message": "Status updated",
            "status": status,
        }

    except Exception as error:
        db.rollback()

        print(
            "Error while updating order status:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to update order status",
        )