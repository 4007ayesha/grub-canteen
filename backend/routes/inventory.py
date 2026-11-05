
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import WasteRecord
from backend.schemas import WasteRecordCreate, WasteRecordOut
from backend.dependencies import get_current_user


router = APIRouter(prefix="/inventory/waste", tags=["waste"])


def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only"
        )
    return user


@router.post("/", response_model=WasteRecordOut)
def log_waste(
    record: WasteRecordCreate,
    db: Session = Depends(get_db),
    _=Depends(admin_only)
):
    if record.sold_qty + record.wasted_qty > record.prepared_qty:
        raise HTTPException(
            status_code=400,
            detail="Sold + wasted cannot exceed prepared quantity"
        )

    new_record = WasteRecord(**record.dict())

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


@router.get("/", response_model=list[WasteRecordOut])
def get_waste_records(
    db: Session = Depends(get_db),
    _=Depends(admin_only)
):
    return (
        db.query(WasteRecord)
        .order_by(WasteRecord.date.desc())
        .all()
    )
