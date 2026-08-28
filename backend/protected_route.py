from fastapi import APIRouter, Depends, HTTPException

from backend.auth import get_current_user

router = APIRouter()


@router.get("/protected")
def protected_route(current_user=Depends(get_current_user)):
    return {
        "message": "You accessed a protected route!",
        "user": current_user
    }


@router.get("/admin-only")
def admin_only(current_user=Depends(get_current_user)):

    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return {
        "message": "Welcome Admin!",
        "user": current_user
    }