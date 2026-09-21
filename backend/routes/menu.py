from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import MenuItem, Category, Inventory
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
@router.get(
    "/categories",
    response_model=list[CategoryOut]
)
def list_categories(
    db: Session = Depends(get_db)
):
    return db.query(Category).all()


# -------------------------
# GET menu items
# -------------------------
@router.get(
    "/items",
    response_model=list[MenuItemOut]
)
def list_items(
    category_id: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem)

    if category_id is not None:
        query = query.filter(
            MenuItem.category_id == category_id
        )

    if search:
        query = query.filter(
            MenuItem.name.ilike(f"%{search}%")
        )

    menu_items = query.all()

    result = []

    for item in menu_items:
        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.menu_item_id == item.id
            )
            .first()
        )

        result.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "category_id": item.category_id,
            "available": item.available,
            "image_url": item.image_url,
            "current_stock": (
                inventory.current_stock
                if inventory
                else 0
            )
        })

    return result


# -------------------------
# Admin check
# -------------------------
def admin_only(
    current_user=Depends(get_current_user)
):
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

    inventory = Inventory(
        menu_item_id=new_item.id,
        current_stock=item.current_stock
    )

    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return {
        "id": new_item.id,
        "name": new_item.name,
        "description": new_item.description,
        "price": new_item.price,
        "category_id": new_item.category_id,
        "available": new_item.available,
        "image_url": new_item.image_url,
        "current_stock": inventory.current_stock
    }

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
    existing_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id)
        .first()
    )

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

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.menu_item_id == existing_item.id
        )
        .first()
    )

    if inventory:
        inventory.current_stock = item.current_stock
    else:
        inventory = Inventory(
            menu_item_id=existing_item.id,
            current_stock=item.current_stock
        )
        db.add(inventory)

    db.commit()
    db.refresh(existing_item)
    db.refresh(inventory)

    return {
        "id": existing_item.id,
        "name": existing_item.name,
        "description": existing_item.description,
        "price": existing_item.price,
        "category_id": existing_item.category_id,
        "available": existing_item.available,
        "image_url": existing_item.image_url,
        "current_stock": inventory.current_stock
    }
# -------------------------
# DELETE menu item
# -------------------------
@router.delete(
    "/items/{item_id}"
)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    existing_item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id)
        .first()
    )

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
    item = (
        db.query(MenuItem)
        .filter(MenuItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.menu_item_id == item.id
        )
        .first()
    )

    return {
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category_id": item.category_id,
        "available": item.available,
        "image_url": item.image_url,
        "current_stock": (
            inventory.current_stock
            if inventory
            else 0
        )
    }