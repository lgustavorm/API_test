from fastapi import FastAPI

from .core.config import settings
from .db import create_db_and_tables
from .routers import auth, health, items

app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


app.include_router(auth.router, prefix="/api/v1")
app.include_router(items.router, prefix="/api/v1")
app.include_router(health.router)
