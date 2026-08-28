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