import os
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status, Request
from app.models.schemas import AnalyzeResponse, AnalyzeTextRequest, SupportedLanguage, OCRMetadata
from app.services.ocr_service import OCRService, ALLOWED_EXTENSIONS, MAX_IMAGE_SIZE_BYTES
from app.services.ai_service import AIService
from app.services.translation_service import TranslationService

analyze_router = APIRouter()
ocr_service = OCRService()
ai_service = AIService()
translation_service = TranslationService()


@analyze_router.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
async def analyze_document_or_text(
    request: Request,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    language: Optional[str] = Form("en"),
) -> AnalyzeResponse:
    """
    Analyze a government web page text or screenshot image upload.
    Pipeline:
    1. Screenshot -> OCR -> Extracted Text
    2. Extracted Text -> AI Page Understanding (Source Language) -> Structured Guidance
    3. Structured Guidance -> Translation -> Response in Selected Target Language
    """
    content_type = request.headers.get("content-type", "")
    target_language = SupportedLanguage.EN

    # 1. Handle JSON request body (Direct text input)
    if "application/json" in content_type:
        try:
            json_body = await request.json()
            payload = AnalyzeTextRequest(**json_body)
            target_language = payload.language
            base_response = ai_service.analyze_government_text(text=payload.text, language=SupportedLanguage.EN)
            return translation_service.translate_analyze_response(base_response, target_language)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid JSON request body: {str(e)}"
            )

    # 2. Parse target language from form parameters
    if language:
        try:
            target_language = SupportedLanguage(language.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unsupported language code '{language}'. Supported: {[l.value for l in SupportedLanguage]}"
            )

    ocr_metadata: Optional[OCRMetadata] = None
    target_text = ""

    # 3. Handle File Upload OCR processing
    if file and file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unsupported image file extension '{ext}'. Allowed extensions: PNG, JPEG/JPG, WEBP."
            )

        file_bytes = await file.read()
        if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Uploaded file exceeds 5MB limit."
            )

        # Execute OCR safely
        ocr_metadata = ocr_service.process_screenshot(file_bytes, file.filename)
        target_text = ocr_metadata.extracted_text

    # 4. If direct form text is provided alongside or instead of file
    if text and text.strip():
        if target_text:
            target_text = f"{target_text}\n{text.strip()}"
        else:
            target_text = text.strip()

    if not target_text and not ocr_metadata:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either extracted text or a valid screenshot image file must be provided."
        )

    # 5. Perform AI Page Understanding in source language
    final_text = target_text if target_text else "Government Service Portal Form Content"
    base_response = ai_service.analyze_government_text(
        text=final_text,
        language=SupportedLanguage.EN,
        ocr_metadata=ocr_metadata
    )

    # 6. Perform structured translation into citizen's target language
    return translation_service.translate_analyze_response(base_response, target_language)
