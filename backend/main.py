from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.auth import router as auth_router
from backend.protected_route import router as protected_router
from backend.routes.menu import router as menu_router
from backend.routes.payment import router as payment_router
from backend.routes.orders import router as orders_router

# Phase 11 - Feedback & Notifications
from backend.routes.feedback import router as feedback_router
from backend.routes.notifications import router as notifications_router

# Phase 12 - Inventory & Waste
from backend.routes.inventory import router as inventory_router

# Phase 13 - Analytics
from backend.routes.analytics import router as analytics_router

# Phase 16 - ML Demand Predictions
from backend.routes.predictions import router as predictions_router


app = FastAPI(title="Grub Canteen API")


# Allow the React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication routes
app.include_router(auth_router)

# Protected routes
app.include_router(protected_router)

# Menu routes
app.include_router(menu_router)

# Payment routes
app.include_router(payment_router)

# Order routes
app.include_router(orders_router)

# Phase 11 - Feedback routes
app.include_router(feedback_router)

# Phase 11 - Notification routes
app.include_router(notifications_router)

# Phase 12 - Inventory & Waste routes
app.include_router(inventory_router)

# Phase 13 - Analytics routes
app.include_router(analytics_router)

# Phase 16 - ML Demand Prediction routes
app.include_router(predictions_router)


# Test route
@app.get("/")
def root():
    return {
        "message": "Grub Canteen API is running"
    }