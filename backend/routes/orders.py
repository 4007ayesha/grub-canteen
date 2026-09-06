import random
import string

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Order, OrderItem, Payment
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


@router.post("/", response_model=OrderOut)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Check that the payment exists
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

    # Online payment must be successful.
    # Cash payment can remain pending.
    if payment.method.lower() != "cash" and payment.status != "success":
        raise HTTPException(
            status_code=400,
            detail="Payment not successful, cannot create order",
        )

    # Create the main order
    new_order = Order(
        user_id=int(user["sub"]),
        token_number=generate_token(),
        total_amount=order.total_amount,
    )

    db.add(new_order)
    db.flush()

    # Create all order items
    for item in order.items:
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price_at_order=item.price_at_order,
        )

        db.add(order_item)

    # Save everything together
    db.commit()
    db.refresh(new_order)

    return new_order


@router.get("/my", response_model=list[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return (
        db.query(Order)
        .filter(Order.user_id == int(user["sub"]))
        .all()
    )


# ============================================================
# PHASE 10 - ADMIN VIEW / FILTER ORDERS
# ============================================================

@router.get("/admin/all", response_model=list[OrderOut])
def admin_all_orders(
    status: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Only admins can view all orders
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only",
        )

    # Start with all orders
    query = db.query(Order).order_by(Order.created_at.desc())

    # If a status was provided, filter the orders
    if status:
        query = query.filter(Order.status == status)

    return query.all()


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

    # Prevent users from viewing someone else's order
    if order.user_id != int(user["sub"]):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this order",
        )

    return order


# ============================================================
# PHASE 9 - WEBSOCKET ORDER TRACKING
# ============================================================

@router.websocket("/ws/{order_id}")
async def order_status_socket(
    websocket: WebSocket,
    order_id: int,
):
    await manager.connect(order_id, websocket)

    try:
        # Keep the WebSocket connection alive
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(order_id, websocket)


# ============================================================
# PHASE 9 - ADMIN STATUS UPDATE
# ============================================================

@router.put("/{order_id}/status")
async def update_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Only admins can change order status
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only",
        )

    # Allowed order statuses
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

    # Find the order
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

    # Remember the old status
    old_status = order.status

    # Update status in the database
    order.status = status

    db.commit()

    # ========================================================
    # PHASE 11 - CREATE NOTIFICATION
    # ========================================================

    # Only create a notification when the status actually changes
    if old_status != status:

        status_messages = {
            "preparing": "Your order is being prepared 👨‍🍳",
            "ready": "Your order is ready for pickup! 🎉",
            "collected": "Order collected. Enjoy your meal!",
        }

        if status in status_messages:
            create_notification(
                db,
                order.user_id,
                status_messages[status],
            )

    # ========================================================
    # PHASE 9 - WEBSOCKET UPDATE
    # ========================================================

    # Tell all students watching this order
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