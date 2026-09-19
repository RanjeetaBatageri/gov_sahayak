from fastapi.testclient import TestClient
from app.main import app
from app.services.tts_service import TTSService, MockTTSProvider
from app.models.schemas import SupportedLanguage

client = TestClient(app)


def test_tts_service_direct():
    service = TTSService(provider=MockTTSProvider())
    text = "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ."
    res = service.generate_speech(text, SupportedLanguage.KN)
    assert res.success is True
    assert res.language == SupportedLanguage.KN
    assert res.audio_url.startswith("data:audio/mp3;base64,")
    assert res.audio_format == "mp3"
    assert res.duration_seconds > 0.0


def test_tts_api_kannada_success():
    payload = {
        "text": "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
        "language": "kn"
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "kn"
    assert data["audio_url"].startswith("data:audio/mp3;base64,")


def test_tts_api_hindi_success():
    payload = {
        "text": "आपका आवेदन सफलतापूर्वक जमा कर दिया गया है।",
        "language": "hi"
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "hi"


def test_tts_api_english_success():
    payload = {
        "text": "Your application has been successfully received.",
        "language": "en"
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "en"


def test_tts_api_unsupported_language():
    payload = {
        "text": "Valid text",
        "language": "invalid_code"
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 422


def test_tts_api_empty_text():
    payload = {
        "text": "   ",
        "language": "kn"
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 422


def test_tts_api_oversized_text():
    payload = {
        "text": "a" * 5001,
        "language": "en"
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 422
