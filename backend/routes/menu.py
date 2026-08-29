from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import MenuItem, Category
from backend.schemas import (
    MenuItemOut,
    MenuItemCreate,
    CategoryOut
)
from backend.auth import get_current_user


router = APIRouter(
    prefix="/menu",
    tags=["Menu"]
)


# -------------------------
# GET all categories
# -------------------------
@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


# -------------------------
# GET menu items
# -------------------------
@router.get("/items", response_model=list[MenuItemOut])
def list_items(
    category_id: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem)

    if category_id is not None:
        query = query.filter(MenuItem.category_id == category_id)

    if search:
        query = query.filter(
            MenuItem.name.ilike(f"%{search}%")
        )

    return query.all()


# -------------------------
# Admin check
# -------------------------
def admin_only(current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


# -------------------------
# ADD menu item
# -------------------------
@router.post(
    "/items",
    response_model=MenuItemOut
)
def create_item(
    item: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    new_item = MenuItem(
        name=item.name,
        description=item.description,
        price=item.price,
        category_id=item.category_id,
        available=item.available,
        image_url=item.image_url
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


# -------------------------
# UPDATE menu item
# -------------------------
@router.put(
    "/items/{item_id}",
    response_model=MenuItemOut
)
def update_item(
    item_id: int,
    item: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    existing_item = db.query(MenuItem).filter(
        MenuItem.id == item_id
    ).first()

    if not existing_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    existing_item.name = item.name
    existing_item.description = item.description
    existing_item.price = item.price
    existing_item.category_id = item.category_id
    existing_item.available = item.available
    existing_item.image_url = item.image_url

    db.commit()
    db.refresh(existing_item)

    return existing_item


# -------------------------
# DELETE menu item
# -------------------------
@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    existing_item = db.query(MenuItem).filter(
        MenuItem.id == item_id
    ).first()

    if not existing_item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    db.delete(existing_item)
    db.commit()

    return {
        "message": "Menu item deleted successfully"
    }


# -------------------------
# GET single menu item
# -------------------------
@router.get(
    "/items/{item_id}",
    response_model=MenuItemOut
)
def get_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    return item