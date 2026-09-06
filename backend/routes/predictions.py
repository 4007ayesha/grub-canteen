from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import DemandPrediction
from backend.schemas import PredictionRequest, PredictionOut
from backend.dependencies import get_current_user
from backend.ml_model import predict_demand


router = APIRouter(
    prefix="/predictions",
    tags=["predictions"],
)


def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only",
        )
    return user


@router.post("/", response_model=PredictionOut)
def create_prediction(
    data: PredictionRequest,
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    predicted_qty = predict_demand(
        menu_item_id=data.menu_item_id,
        day_of_week=data.day_of_week,
        previous_day_sales=data.previous_day_sales,
        seven_day_avg=data.seven_day_avg,
        is_holiday=data.is_holiday,
        is_college_event=data.is_college_event,
    )

    prediction = DemandPrediction(
        menu_item_id=data.menu_item_id,
        date=data.date,
        predicted_qty=predicted_qty,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction


@router.get("/", response_model=list[PredictionOut])
def get_predictions(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    return (
        db.query(DemandPrediction)
        .order_by(DemandPrediction.date.desc())
        .all()
    )


@router.put("/{prediction_id}/actual", response_model=PredictionOut)
def update_actual(
    prediction_id: int,
    actual_qty: int,
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    if actual_qty < 0:
        raise HTTPException(
            status_code=400,
            detail="Actual quantity cannot be negative",
        )

    prediction = (
        db.query(DemandPrediction)
        .filter(DemandPrediction.id == prediction_id)
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found",
        )

    prediction.actual_qty = actual_qty

    db.commit()
    db.refresh(prediction)

    return prediction