
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Feedback, Order
from backend.schemas import FeedbackCreate, FeedbackOut
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/feedback",
    tags=["feedback"],
)


# -----------------------------------------
# Submit Feedback
# -----------------------------------------

@router.post("/", response_model=FeedbackOut)
def submit_feedback(
    fb: FeedbackCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Find the order belonging to the logged-in user
    order = (
        db.query(Order)
        .filter(
            Order.id == fb.order_id,
            Order.user_id == int(user["sub"]),
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found for this user",
        )

    # Feedback is allowed only for collected orders
    if order.status != "collected":
        raise HTTPException(
            status_code=400,
            detail="Can only review collected orders",
        )

    # Prevent the same user from reviewing the same order twice
    existing_feedback = (
        db.query(Feedback)
        .filter(
            Feedback.order_id == fb.order_id,
            Feedback.user_id == int(user["sub"]),
        )
        .first()
    )

    if existing_feedback:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted feedback for this order",
        )

    # Create feedback
    new_feedback = Feedback(
        order_id=fb.order_id,
        user_id=int(user["sub"]),
        rating=fb.rating,
        comment=fb.comment,
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return new_feedback


# -----------------------------------------
# Admin - View All Feedback
# -----------------------------------------

@router.get("/admin/all", response_model=list[FeedbackOut])
def all_feedback(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Only admins can view all feedback
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only",
        )

    return (
        db.query(Feedback)
        .order_by(Feedback.created_at.desc())
        .all()
    )

