from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Date,
    Enum,
    Text,
    DECIMAL,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database import Base


# ============================================================
# USERS
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    role = Column(
        Enum("student", "admin"),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )


# ============================================================
# CATEGORIES
# ============================================================

class Category(Base):
    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    name = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    items = relationship(
        "MenuItem",
        back_populates="category",
    )


# ============================================================
# MENU ITEMS
# ============================================================

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    price = Column(
        DECIMAL(8, 2),
        nullable=False,
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False,
    )

    available = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    image_url = Column(
        String(500),
        nullable=True,
    )

    category = relationship(
        "Category",
        back_populates="items",
    )


# ============================================================
# PAYMENTS
# ============================================================

class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    status = Column(
        String(20),
        default="pending",
        nullable=False,
    )

    method = Column(
        String(50),
        nullable=False,
    )

    amount = Column(
        DECIMAL(8, 2),
        nullable=False,
    )

    paid_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ============================================================
# ORDERS
# ============================================================

class Order(Base):
    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    token_number = Column(
        String(10),
        nullable=False,
    )

    status = Column(
        Enum(
            "received",
            "preparing",
            "ready",
            "collected",
        ),
        default="received",
        nullable=False,
    )

    total_amount = Column(
        DECIMAL(8, 2),
        nullable=False,
    )

    payment_method = Column(
        String(20),
        nullable=False,
        default="Cash",
    )

    payment_status = Column(
        String(20),
        nullable=False,
        default="Pending",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )


# ============================================================
# ORDER ITEMS
# ============================================================

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False,
    )

    menu_item_id = Column(
        Integer,
        ForeignKey("menu_items.id"),
        nullable=False,
    )

    quantity = Column(
        Integer,
        nullable=False,
    )

    price_at_order = Column(
        DECIMAL(8, 2),
        nullable=False,
    )

    order = relationship(
        "Order",
        back_populates="items",
    )


# ============================================================
# PHASE 11 - FEEDBACK
# ============================================================

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ============================================================
# PHASE 11 - NOTIFICATIONS
# ============================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    message = Column(
        String(255),
        nullable=False,
    )

    read = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


# ============================================================
# PHASE 12 - INVENTORY
# ============================================================

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    menu_item_id = Column(
        Integer,
        ForeignKey("menu_items.id"),
        unique=True,
        nullable=False,
    )

    current_stock = Column(
        Integer,
        default=0,
        nullable=False,
    )

    min_threshold = Column(
        Integer,
        default=10,
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        server_default=func.now(),
    )


# ============================================================
# PHASE 12 - WASTE RECORDS
# ============================================================

class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    menu_item_id = Column(
        Integer,
        ForeignKey("menu_items.id"),
        nullable=False,
    )

    date = Column(
        Date,
        nullable=False,
    )

    prepared_qty = Column(
        Integer,
        nullable=False,
    )

    sold_qty = Column(
        Integer,
        nullable=False,
    )

    wasted_qty = Column(
        Integer,
        nullable=False,
    )


# ============================================================
# PHASE 16 - DEMAND PREDICTIONS
# ============================================================

class DemandPrediction(Base):
    __tablename__ = "demand_predictions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    menu_item_id = Column(
        Integer,
        ForeignKey("menu_items.id"),
        nullable=False,
    )

    date = Column(
        Date,
        nullable=False,
    )

    predicted_qty = Column(
        Integer,
        nullable=False,
    )

    actual_qty = Column(
        Integer,
        nullable=True,
    )