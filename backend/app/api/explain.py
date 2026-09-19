from fastapi import APIRouter
from app.models.schemas import ExplainRequest, ExplainResponse
from app.services.mock_service import MockService

explain_router = APIRouter()


@explain_router.post("/explain", response_model=ExplainResponse, tags=["Explanation"])
async def explain_text(payload: ExplainRequest) -> ExplainResponse:
    """Simplify government/legal terminology into easy-to-understand language."""
    return MockService.explain(payload.text, payload.language)
