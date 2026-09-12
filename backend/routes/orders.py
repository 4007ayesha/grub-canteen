import random
import string

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


def generate_token():
    return "T" + "".join(
        random.choices(string.digits, k=4)
    )


def order_response(order, payment):
    return {
        "id": order.id,
        "token_number": order.token_number,
        "status": order.status,
        "total_amount": order.total_amount,
        "items": order.items,
        "payment_method": payment.method if payment else None,
        "payment_status": payment.status if payment else None,
    }


# ============================================================
# CREATE ORDER
# ============================================================

@router.post("/", response_model=OrderOut)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # --------------------------------------------------------
    # Check payment
    # --------------------------------------------------------

    payment = (
        db.query(Payment)
        .filter(Payment.id == order.payment_id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found",
        )

    # Online payments must be successful.
    # Cash payments may remain pending.
    if (
        payment.method.lower() != "cash"
        and payment.status != "success"
    ):
        raise HTTPException(
            status_code=400,
            detail="Payment not successful, cannot create order",
        )

    # --------------------------------------------------------
    # Validate order
    # --------------------------------------------------------

    if not order.items:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one item",
        )

    inventory_records = []

    for item in order.items:

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than zero",
            )

        menu_item = (
            db.query(MenuItem)
            .filter(MenuItem.id == item.menu_item_id)
            .first()
        )

        if not menu_item:
            raise HTTPException(
                status_code=404,
                detail=f"Menu item {item.menu_item_id} not found",
            )

        if not menu_item.available:
            raise HTTPException(
                status_code=400,
                detail=f"{menu_item.name} is currently unavailable",
            )

        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.menu_item_id == item.menu_item_id
            )
            .first()
        )

        if not inventory:
            raise HTTPException(
                status_code=400,
                detail=f"Stock not configured for {menu_item.name}",
            )

        if inventory.current_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Not enough stock for {menu_item.name}. "
                    f"Available stock: {inventory.current_stock}"
                ),
            )

        inventory_records.append(
            (inventory, item.quantity)
        )

    # --------------------------------------------------------
    # Create order
    # --------------------------------------------------------

    new_order = Order(
        user_id=int(user["sub"]),
        token_number=generate_token(),
        total_amount=order.total_amount,
        payment_id=order.payment_id,
    )

    db.add(new_order)
    db.flush()

    # --------------------------------------------------------
    # Create order items
    # --------------------------------------------------------

    for item in order.items:

        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price_at_order=item.price_at_order,
        )

        db.add(order_item)

    # --------------------------------------------------------
    # Deduct stock
    # --------------------------------------------------------

    for inventory, quantity in inventory_records:
        inventory.current_stock -= quantity

    db.commit()
    db.refresh(new_order)

    # Load order items before returning
    db.refresh(new_order)

    return order_response(new_order, payment)


# ============================================================
# GET MY ORDERS
# ============================================================

@router.get("/my", response_model=list[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == int(user["sub"]))
        .order_by(Order.id.desc())
        .all()
    )

    result = []

    for order in orders:
        payment = None

        if getattr(order, "payment_id", None):
            payment = (
                db.query(Payment)
                .filter(Payment.id == order.payment_id)
                .first()
            )

        result.append(
            order_response(order, payment)
        )

    return result


# ============================================================
# ADMIN VIEW / FILTER ORDERS
# ============================================================

@router.get("/admin/all", response_model=list[OrderOut])
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
        .order_by(Order.created_at.desc())
    )

    if status:
        query = query.filter(
            Order.status == status
        )

    orders = query.all()

    result = []

    for order in orders:
        payment = None

        if getattr(order, "payment_id", None):
            payment = (
                db.query(Payment)
                .filter(Payment.id == order.payment_id)
                .first()
            )

        result.append(
            order_response(order, payment)
        )

    return result


# ============================================================
# GET SINGLE ORDER
# ============================================================

@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    if (
        user["role"] != "admin"
        and order.user_id != int(user["sub"])
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this order",
        )

    payment = None

    if getattr(order, "payment_id", None):
        payment = (
            db.query(Payment)
            .filter(Payment.id == order.payment_id)
            .first()
        )

    return order_response(order, payment)


# ============================================================
# WEBSOCKET ORDER TRACKING
# ============================================================

@router.websocket("/ws/{order_id}")
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

@router.put("/{order_id}/status")
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

    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    status_flow = {
        "received": ["preparing"],
        "preparing": ["ready"],
        "ready": ["collected"],
        "collected": [],
    }

    old_status = order.status

    if status not in status_flow.get(old_status, []):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid status transition: "
                f"{old_status} -> {status}"
            ),
        )

    order.status = status

    db.commit()

    status_messages = {
        "preparing": (
            "Your order is being prepared 👨‍🍳"
        ),
        "ready": (
            "Your order is ready for pickup! 🎉"
        ),
        "collected": (
            "Order collected. Enjoy your meal!"
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