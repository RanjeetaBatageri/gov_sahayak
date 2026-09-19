import io
import os
from fastapi.testclient import TestClient
from app.main import app
from app.services.ocr_service import OCRService, validate_image_header, LOW_CONFIDENCE_WARNING

client = TestClient(app)

# Standard image headers for test fixtures
PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 200
JPEG_HEADER = b"\xff\xd8\xff\xe0" + b"\x00" * 200
WEBP_HEADER = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"\x00" * 200


def test_validate_image_header_success():
    valid_png, mime_png = validate_image_header(PNG_HEADER)
    assert valid_png is True
    assert mime_png == "image/png"

    valid_jpeg, mime_jpeg = validate_image_header(JPEG_HEADER)
    assert valid_jpeg is True
    assert mime_jpeg == "image/jpeg"

    valid_webp, mime_webp = validate_image_header(WEBP_HEADER)
    assert valid_webp is True
    assert mime_webp == "image/webp"


def test_validate_image_header_invalid():
    invalid_bytes = b"INVALID_HEADER_DATA_12345"
    valid, msg = validate_image_header(invalid_bytes)
    assert valid is False
    assert "Unsupported or corrupted" in msg


def test_ocr_service_temporary_file_cleanup():
    ocr_service = OCRService()
    # Execute processing
    result = ocr_service.process_screenshot(PNG_HEADER, "test_screenshot.png")
    assert result.ocr_applied is True
    assert result.confidence > 0.0
    assert result.extracted_text != ""
    # Ensure temporary file was cleaned up and no leftover file remains


def test_analyze_screenshot_upload_png():
    files = {"file": ("screenshot.png", io.BytesIO(PNG_HEADER), "image/png")}
    data = {"language": "en"}
    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["ocr_metadata"] is not None
    assert res_data["ocr_metadata"]["ocr_applied"] is True
    assert "extracted_text" in res_data["ocr_metadata"]


def test_analyze_unsupported_image_extension():
    files = {"file": ("document.gif", io.BytesIO(b"GIF89a..."), "image/gif")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 422
    assert "Unsupported image file extension" in response.json()["detail"]


def test_analyze_oversized_file():
    huge_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * (5 * 1024 * 1024 + 10)
    files = {"file": ("huge_screenshot.png", io.BytesIO(huge_bytes), "image/png")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 413
    assert "exceeds 5MB limit" in response.json()["detail"]


def test_ocr_low_confidence_warning():
    ocr_service = OCRService()
    # Pass tiny 10-byte corrupted image to trigger low confidence check
    tiny_header = b"\x89PNG\r\n\x1a\n12"
    result = ocr_service.process_screenshot(tiny_header, "blurry.png")
    assert result.ocr_applied is True
    assert LOW_CONFIDENCE_WARNING in result.warnings
