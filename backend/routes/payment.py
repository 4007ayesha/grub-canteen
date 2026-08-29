import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Payment
from backend.schemas import PaymentCreate, PaymentOut
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/payment",
    tags=["payment"]
)


@router.post("/mock-pay", response_model=PaymentOut)
def mock_pay(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    outcome = random.choices(
        ["success", "failed"],
        weights=[90, 10]
    )[0]

    new_payment = Payment(
        status=outcome,
        method=payment.method,
        amount=payment.amount
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return new_payment