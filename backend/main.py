from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from protected_route import router as protected_router

app = FastAPI(title="Grub Canteen API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(protected_router)


@app.get("/")
def root():
    return {"message": "Grub Canteen API is running"}