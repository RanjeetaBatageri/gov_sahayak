from fastapi.testclient import TestClient
from app.main import app
from app.services.translation_service import TranslationService, MockTranslationProvider
from app.models.schemas import SupportedLanguage, AnalyzeResponse, FormField

client = TestClient(app)


def test_translation_service_direct():
    service = TranslationService(provider=MockTranslationProvider())
    text = "Government Service Application Form for Aadhaar Card ID 1234-5678-9012."
    res = service.translate_text(text, SupportedLanguage.EN, SupportedLanguage.KN)
    assert res.success is True
    assert res.target_language == SupportedLanguage.KN
    # Ensure proper names & numbers preserved
    assert "1234-5678-9012" in res.translated_text
    assert "Aadhaar Card ID" in res.translated_text


def test_translate_api_endpoint_success():
    payload = {
        "text": "Full Name of Applicant",
        "source_language": "en",
        "target_language": "hi"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["source_language"] == "en"
    assert data["target_language"] == "hi"
    assert "आवेदक का पूरा नाम" in data["translated_text"]


def test_translate_api_unsupported_language():
    payload = {
        "text": "Test translation",
        "source_language": "en",
        "target_language": "invalid_code"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 422


def test_translate_api_empty_text():
    payload = {
        "text": "   ",
        "source_language": "en",
        "target_language": "kn"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 422


def test_analyze_with_target_language_kannada():
    payload = {
        "text": (
            "Government of Karnataka Revenue Department. "
            "Application for Caste and Income Certificate. "
            "Full Name of Applicant: Ramesh Kumar. "
            "Aadhaar Number: 1234-5678-9012."
        ),
        "language": "kn"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "kn"
    # Ensure fields translated into Kannada terms
    field_labels = [f["label"] for f in data["fields"]]
    assert any("ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು" in label for label in field_labels)
