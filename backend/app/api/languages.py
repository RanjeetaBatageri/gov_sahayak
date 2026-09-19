from fastapi import APIRouter
from app.models.schemas import LanguagesResponse, LANGUAGE_DETAILS, LanguageItem

languages_router = APIRouter()


@languages_router.get("/languages", response_model=LanguagesResponse, tags=["Languages"])
async def get_languages() -> LanguagesResponse:
    """Return the list of currently supported Indian & English languages."""
    items = [LanguageItem(**lang) for lang in LANGUAGE_DETAILS]
    return LanguagesResponse(success=True, languages=items)
