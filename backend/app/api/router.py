from fastapi import APIRouter
from app.api.health import health_router
from app.api.languages import languages_router
from app.api.analyze import analyze_router
from app.api.explain import explain_router
from app.api.translate import translate_router
from app.api.tts import tts_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(languages_router)
api_router.include_router(analyze_router)
api_router.include_router(explain_router)
api_router.include_router(translate_router)
api_router.include_router(tts_router)
