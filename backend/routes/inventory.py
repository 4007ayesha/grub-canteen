from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Inventory, WasteRecord
from backend.schemas import (
    InventoryUpdate,
    InventoryOut,
    WasteRecordCreate,
    WasteRecordOut,
)
from backend.dependencies import get_current_user


router = APIRouter(prefix="/inventory", tags=["inventory"])


# -------------------------
# Admin-only dependency
# -------------------------

def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only"
        )

    return user


# -------------------------
# Inventory
# -------------------------

@router.get("/", response_model=list[InventoryOut])
def list_inventory(
    db: Session = Depends(get_db),
    _=Depends(admin_only)
):
    return db.query(Inventory).all()


@router.get("/low-stock", response_model=list[InventoryOut])
def low_stock(
    db: Session = Depends(get_db),
    _=Depends(admin_only)
):
    return (
        db.query(Inventory)
        .filter(Inventory.current_stock <= Inventory.min_threshold)
        .all()
    )


@router.put("/{menu_item_id}", response_model=InventoryOut)
def update_inventory(
    menu_item_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
    _=Depends(admin_only)
):
    if data.current_stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative"
        )

    if data.min_threshold < 0:
        raise HTTPException(
            status_code=400,
            detail="Minimum threshold cannot be negative"
        )

    inv = (
        db.query(Inventory)
        .filter(Inventory.menu_item_id == menu_item_id)
        .first()
    )

    if not inv:
        inv = Inventory(
            menu_item_id=menu_item_id,
            current_stock=data.current_stock,
            min_threshold=data.min_threshold
        )
        db.add(inv)
    else:
        inv.current_stock = data.current_stock
        inv.min_threshold = data.min_threshold

    db.commit()
    db.refresh(inv)

    return inv


# -------------------------
# Waste Records
# -------------------------

@router.post("/waste", response_model=WasteRecordOut)
def log_waste(
    record: WasteRecordCreate,
    db: Session = Depends(get_db),
    _=Depends(admin_only)
):
    if record.prepared_qty < 0:
        raise HTTPException(
            status_code=400,
            detail="Prepared quantity cannot be negative"
        )

    if record.sold_qty < 0:
        raise HTTPException(
            status_code=400,
            detail="Sold quantity cannot be negative"
        )

    if record.wasted_qty < 0:
        raise HTTPException(
            status_code=400,
            detail="Wasted quantity cannot be negative"
        )

    if record.sold_qty + record.wasted_qty > record.prepared_qty:
        raise HTTPException(
            status_code=400,
            detail="Sold + wasted cannot exceed prepared quantity"
        )

    new_record = WasteRecord(
        **record.dict()
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


@router.get("/waste", response_model=list[WasteRecordOut])
def get_waste_records(
    db: Session = Depends(get_db),
    _=Depends(admin_only)
):
    return (
        db.query(WasteRecord)
        .order_by(WasteRecord.date.desc())
        .all()
    )