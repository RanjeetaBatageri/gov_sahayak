import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app_name" in data
    assert "environment" in data
    assert "timestamp" in data


def test_get_languages_endpoint():
    response = client.get("/api/languages")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["languages"]) == 8
    codes = [l["code"] for l in data["languages"]]
    for expected in ["en", "hi", "kn", "te", "ta", "ml", "mr", "bn"]:
        assert expected in codes


def test_analyze_json_success():
    payload = {
        "text": "Application Form for Income Certificate from Revenue Department.",
        "url": "https://serviceonline.gov.in",
        "language": "en"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "page_purpose" in data
    assert "simple_explanation" in data
    assert isinstance(data["fields"], list)
    assert isinstance(data["required_documents"], list)
    assert isinstance(data["steps"], list)
    assert isinstance(data["warnings"], list)


def test_analyze_multipart_file_success():
    file_content = b"Mock image file content bytes"
    files = {"file": ("screenshot.png", io.BytesIO(file_content), "image/png")}
    data = {"language": "hi"}
    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["language"] == "hi"


def test_analyze_empty_text_error():
    payload = {"text": "   ", "language": "en"}
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422


def test_analyze_unsupported_language_error():
    payload = {"text": "Valid form content", "language": "fr"}
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422


def test_explain_success():
    payload = {
        "text": "The applicant must produce a bonafide domicile certificate attested by a Gazetted Officer.",
        "language": "en"
    }
    response = client.post("/api/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["original_text"] == payload["text"]
    assert "simple_explanation" in data
    assert data["language"] == "en"


def test_explain_empty_text_error():
    payload = {"text": "", "language": "en"}
    response = client.post("/api/explain", json=payload)
    assert response.status_code == 422


def test_explain_unsupported_language_error():
    payload = {"text": "Some legal clause text", "language": "es"}
    response = client.post("/api/explain", json=payload)
    assert response.status_code == 422


def test_translate_success():
    payload = {
        "text": "Please submit your application before 30th September.",
        "source_language": "en",
        "target_language": "kn"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "translated_text" in data
    assert data["source_language"] == "en"
    assert data["target_language"] == "kn"


def test_translate_invalid_language():
    payload = {
        "text": "Sample text",
        "source_language": "invalid",
        "target_language": "kn"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 422


def test_tts_success():
    payload = {
        "text": "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
        "language": "kn"
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["language"] == "kn"
    assert "audio_url" in data
    assert data["audio_format"] == "mp3"


def test_tts_empty_text_error():
    payload = {"text": "  ", "language": "kn"}
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 422


def test_input_size_limit_exceeded():
    long_text = "a" * 10001
    payload = {"text": long_text, "language": "en"}
    response = client.post("/api/explain", json=payload)
    assert response.status_code == 422
