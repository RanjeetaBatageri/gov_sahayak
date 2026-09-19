import base64
import logging
from abc import ABC, abstractmethod
from typing import Tuple, Optional
from app.config import settings
from app.models.schemas import SupportedLanguage, TTSResponse

logger = logging.getLogger("govsahayak.tts")

MAX_TTS_TEXT_LENGTH = 5000

# Valid minimal MP3 header base64 snippet for mock/offline audio playback
MOCK_MP3_BASE64 = (
    "SUQzBAAAAAAAI1RTU0UAAAAPAAAMTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "//NExAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
    "VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
)


class BaseTTSProvider(ABC):
    """Abstract base class for Text-to-Speech providers."""

    @abstractmethod
    def generate_audio(self, text: str, language: SupportedLanguage) -> Tuple[str, str, float]:
        """Returns Tuple[audio_url_or_base64_data_uri, format, duration_seconds]."""
        pass


class MockTTSProvider(BaseTTSProvider):
    """Deterministic, safe mock TTS provider for development and hackathons."""

    def generate_audio(self, text: str, language: SupportedLanguage) -> Tuple[str, str, float]:
        # Log character count only to protect personal information privacy
        logger.info(f"Generating mock TTS audio payload for language '{language.value}' (text length={len(text)} chars)")

        duration = round(max(1.5, len(text) * 0.08), 2)
        data_uri = f"data:audio/mp3;base64,{MOCK_MP3_BASE64}"
        return data_uri, "mp3", duration


class TTSService:
    """Service wrapper managing TTS provider execution and privacy checks."""

    def __init__(self, provider: Optional[BaseTTSProvider] = None):
        self.provider = provider or MockTTSProvider()

    def generate_speech(self, text: str, language: SupportedLanguage) -> TTSResponse:
        """Generates frontend-friendly base64 Data URI audio response for input text."""
        if not text or not text.strip():
            raise ValueError("Input text for speech generation cannot be empty.")

        clean_text = text.strip()
        if len(clean_text) > MAX_TTS_TEXT_LENGTH:
            raise ValueError(f"Text length exceeds maximum allowed limit of {MAX_TTS_TEXT_LENGTH} characters.")

        # Log request privacy compliance
        logger.info(f"Processing TTS generation request for language='{language.value}' (length={len(clean_text)})")

        audio_url, audio_format, duration = self.provider.generate_audio(clean_text, language)

        return TTSResponse(
            success=True,
            text=clean_text,
            language=language,
            audio_url=audio_url,
            audio_format=audio_format,
            duration_seconds=duration
        )
