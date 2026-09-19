from fastapi import APIRouter, HTTPException, status
from app.models.schemas import TranslateRequest, TranslateResponse
from app.services.translation_service import TranslationService

translate_router = APIRouter()
translation_service = TranslationService()


@translate_router.post("/translate", response_model=TranslateResponse, tags=["Translation"])
async def translate_text(payload: TranslateRequest) -> TranslateResponse:
    """Translate text between supported Indian languages and English."""
    try:
        return translation_service.translate_text(
            text=payload.text,
            source_language=payload.source_language,
            target_language=payload.target_language
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failure: {str(e)}"
        )
