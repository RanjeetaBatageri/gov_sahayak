from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings

health_router = APIRouter()


class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    timestamp: str


@health_router.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check() -> HealthCheckResponse:
    """Health check endpoint to verify backend operational status."""
    return HealthCheckResponse(
        status="ok",
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
