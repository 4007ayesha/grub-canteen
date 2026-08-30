import random
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Order, OrderItem, Payment
from backend.schemas import OrderCreate, OrderOut
from backend.dependencies import get_current_user


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