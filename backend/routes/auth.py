from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserLogin
from backend.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Normal registration always creates a student
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role="student"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registered successfully"
    }


@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    # Check email and password
    if not user or not verify_password(
        credentials.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT with user ID and role
    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": token,
        "role": user.role
    }