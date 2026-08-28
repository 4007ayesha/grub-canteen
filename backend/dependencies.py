from fastapi import Depends, HTTPException

from backend.auth import get_current_user


def admin_only(current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user