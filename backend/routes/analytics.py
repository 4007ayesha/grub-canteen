from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import (
    Order,
    OrderItem,
    MenuItem,
    Feedback,
    WasteRecord,
)
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only",
        )
    return user


# ============================================================
# PHASE 13 - ANALYTICS SUMMARY
# ============================================================

@router.get("/summary")
def summary(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    total_revenue = (
        db.query(func.sum(Order.total_amount)).scalar() or 0
    )

    total_orders = (
        db.query(func.count(Order.id)).scalar() or 0
    )

    pending_orders = (
        db.query(func.count(Order.id))
        .filter(
            Order.status.in_(["received", "preparing"])
        )
        .scalar()
        or 0
    )

    total_menu_items = (
        db.query(func.count(MenuItem.id)).scalar() or 0
    )

    return {
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_menu_items": total_menu_items,
    }


# ============================================================
# PHASE 13 - POPULAR ITEMS
# ============================================================

@router.get("/popular-items")
def popular_items(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    results = (
        db.query(
            MenuItem.name,
            func.sum(OrderItem.quantity).label("total_sold"),
        )
        .join(
            OrderItem,
            OrderItem.menu_item_id == MenuItem.id,
        )
        .group_by(MenuItem.id, MenuItem.name)
        .order_by(
            func.sum(OrderItem.quantity).desc()
        )
        .limit(5)
        .all()
    )

    return [
        {
            "name": result.name,
            "total_sold": result.total_sold,
        }
        for result in results
    ]


# ============================================================
# PHASE 13 - ORDER TREND
# ============================================================

@router.get("/order-trend")
def order_trend(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    results = (
        db.query(
            func.date(Order.created_at).label("day"),
            func.count(Order.id).label("count"),
        )
        .group_by(
            func.date(Order.created_at)
        )
        .order_by("day")
        .all()
    )

    return [
        {
            "day": str(result.day),
            "count": result.count,
        }
        for result in results
    ]


# ============================================================
# PHASE 13 - FEEDBACK SUMMARY
# ============================================================

@router.get("/feedback-summary")
def feedback_summary(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    avg_rating = (
        db.query(func.avg(Feedback.rating)).scalar() or 0
    )

    total_feedback = (
        db.query(func.count(Feedback.id)).scalar() or 0
    )

    return {
        "average_rating": round(float(avg_rating), 2),
        "total_feedback": total_feedback,
    }


# ============================================================
# PHASE 13 - WASTE SUMMARY
# ============================================================

@router.get("/waste-summary")
def waste_summary(
    db: Session = Depends(get_db),
    _=Depends(admin_only),
):
    total_prepared = (
        db.query(
            func.sum(WasteRecord.prepared_qty)
        ).scalar()
        or 0
    )

    total_sold = (
        db.query(
            func.sum(WasteRecord.sold_qty)
        ).scalar()
        or 0
    )

    total_wasted = (
        db.query(
            func.sum(WasteRecord.wasted_qty)
        ).scalar()
        or 0
    )

    waste_percentage = (
        total_wasted / total_prepared * 100
        if total_prepared
        else 0
    )

    return {
        "total_prepared": total_prepared,
        "total_sold": total_sold,
        "total_wasted": total_wasted,
        "waste_percentage": round(
            waste_percentage,
            2,
        ),
    }