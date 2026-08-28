from sqlalchemy import Column, Integer, String, DateTime, Enum, Text, DECIMAL, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("student", "admin"), nullable=False)
    created_at = Column(DateTime)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    items = relationship("MenuItem", back_populates="category")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(DECIMAL(8, 2), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    available = Column(Boolean, default=True)
    image_url = Column(String(500), nullable=True)

    category = relationship("Category", back_populates="items")