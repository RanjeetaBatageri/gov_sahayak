from fastapi import APIRouter, HTTPException, status
from app.models.schemas import TTSRequest, TTSResponse
from app.services.tts_service import TTSService

tts_router = APIRouter()
tts_service = TTSService()


@tts_router.post("/tts", response_model=TTSResponse, tags=["Audio Speech"])
async def text_to_speech(payload: TTSRequest) -> TTSResponse:
    """Generate audio speech response for provided text and target language."""
    try:
        return tts_service.generate_speech(text=payload.text, language=payload.language)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech generation error: {str(e)}"
        )
