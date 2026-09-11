from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date


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
    price: float = Field(gt=0)
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


# -------------------------
# Phase 11 - Feedback Schemas
# -------------------------

class FeedbackCreate(BaseModel):
    order_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class FeedbackOut(FeedbackCreate):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# Phase 11 - Notification Schemas
# -------------------------

class NotificationOut(BaseModel):
    id: int
    message: str
    read: bool

    class Config:
        from_attributes = True


# -------------------------
# Phase 12 - Inventory Schemas
# -------------------------

class InventoryUpdate(BaseModel):
    current_stock: int
    min_threshold: int = 10


class InventoryOut(BaseModel):
    id: int
    menu_item_id: int
    current_stock: int
    min_threshold: int

    class Config:
        from_attributes = True


# -------------------------
# Phase 12 - Waste Record Schemas
# -------------------------

class WasteRecordCreate(BaseModel):
    menu_item_id: int
    date: date
    prepared_qty: int
    sold_qty: int
    wasted_qty: int


class WasteRecordOut(WasteRecordCreate):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# Phase 16 - Demand Prediction Schemas
# -------------------------

class PredictionRequest(BaseModel):
    menu_item_id: int
    date: date
    day_of_week: int
    previous_day_sales: int
    seven_day_avg: float
    is_holiday: bool
    is_college_event: bool


class PredictionOut(BaseModel):
    id: int
    menu_item_id: int
    date: date
    predicted_qty: int
    actual_qty: Optional[int] = None

    class Config:
        from_attributes = True