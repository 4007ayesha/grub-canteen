from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Notification
from backend.schemas import NotificationOut
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)


# -----------------------------------------
# Helper - Create Notification
# -----------------------------------------

def create_notification(
    db: Session,
    user_id: int,
    message: str,
):
    notification = Notification(
        user_id=user_id,
        message=message,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# -----------------------------------------
# Get My Notifications
# -----------------------------------------

@router.get("/", response_model=list[NotificationOut])
def my_notifications(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == int(user["sub"]))
        .order_by(Notification.created_at.desc())
        .all()
    )


# -----------------------------------------
# Mark Notification as Read
# -----------------------------------------

@router.put("/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notif_id,
            Notification.user_id == int(user["sub"]),
        )
        .first()
    )

    if notification:
        notification.read = True
        db.commit()

    return {
        "message": "Marked read"
    }