from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------
# Phase 5 - Menu Schemas
# -------------------------

class CategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    available: bool = True
    image_url: Optional[str] = None


class MenuItemOut(MenuItemCreate):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# Phase 7 - Payment Schemas
# -------------------------

class PaymentCreate(BaseModel):
    amount: float
    method: str


class PaymentOut(BaseModel):
    id: int
    status: str
    method: str
    amount: float

    class Config:
        from_attributes = True


# -------------------------
# Phase 8 - Order Schemas
# -------------------------

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    price_at_order: float


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    total_amount: float
    payment_id: int


class OrderItemOut(OrderItemCreate):
    id: int

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    token_number: str
    status: str
    total_amount: float
    items: list[OrderItemOut]

    class Config:
        from_attributes = True