from typing import Optional
from app.models.schemas import (
    AnalyzeResponse,
    ExplainResponse,
    TranslateResponse,
    TTSResponse,
    SupportedLanguage,
    FormField,
    RequiredDocument,
    ActionStep,
    OCRMetadata,
)


class MockService:
    """Mock service providing deterministic contract responses for GovSahayak API features."""

    @staticmethod
    def analyze(text_sample: str, language: SupportedLanguage, ocr_metadata: Optional[OCRMetadata] = None) -> AnalyzeResponse:
        warnings_list = [
            "Ensure all uploaded documents are under 2MB in size.",
            "Application details must exactly match your official photo ID."
        ]
        if ocr_metadata and ocr_metadata.warnings:
            warnings_list.extend(ocr_metadata.warnings)

        return AnalyzeResponse(
            success=True,
            page_purpose="Government Service Application Form (Income Certificate / Caste Certificate / Scheme Benefit)",
            simple_explanation=(
                f"This form allows eligible citizens to apply for government scheme benefits and official certificates. "
                f"[Analysis based on extracted text snippet: '{text_sample[:60]}...']"
            ),
            language=language,
            ocr_metadata=ocr_metadata,
            fields=[
                FormField(
                    field_id="applicant_name",
                    label="Full Name",
                    description="Enter your full legal name as per your Aadhaar card.",
                    is_required=True,
                    example_input="Ramesh Kumar"
                ),
                FormField(
                    field_id="aadhaar_number",
                    label="Aadhaar Number",
                    description="Enter 12-digit UIDAI Aadhaar number.",
                    is_required=True,
                    example_input="1234-5678-9012"
                ),
                FormField(
                    field_id="annual_income",
                    label="Annual Household Income (₹)",
                    description="Enter total annual family income from all sources.",
                    is_required=False,
                    example_input="120000"
                )
            ],
            required_documents=[
                RequiredDocument(
                    name="Aadhaar Card",
                    description="Photocopy of UIDAI Aadhaar card for identity verification.",
                    is_mandatory=True
                ),
                RequiredDocument(
                    name="Ration Card / Address Proof",
                    description="Proof of residence within the state.",
                    is_mandatory=True
                ),
                RequiredDocument(
                    name="Salary Slip / Income Self-Declaration",
                    description="Recent income proof certified by employer or self-attested.",
                    is_mandatory=False
                )
            ],
            steps=[
                ActionStep(
                    step_number=1,
                    title="Fill Personal Details",
                    description="Complete your full name, father's name, and contact details."
                ),
                ActionStep(
                    step_number=2,
                    title="Upload Supporting Documents",
                    description="Attach clear scanned PDF or image copies of mandatory documents."
                ),
                ActionStep(
                    step_number=3,
                    title="Submit & Track Application",
                    description="Submit the form online and save your 15-digit application reference number."
                )
            ],
            warnings=warnings_list
        )

    @staticmethod
    def explain(text: str, language: SupportedLanguage) -> ExplainResponse:
        return ExplainResponse(
            success=True,
            original_text=text,
            simple_explanation=(
                f"In simple terms: '{text}' means that you need to submit your application along with required identity proof "
                f"to your local Tehsil/Seva Kendra office within 30 days to avoid cancellation."
            ),
            language=language,
            warnings=[
                "This simplified explanation is generated for informational guidance only."
            ]
        )

    @staticmethod
    def translate(text: str, source_language: SupportedLanguage, target_language: SupportedLanguage) -> TranslateResponse:
        mock_translations = {
            SupportedLanguage.KN: f"[Kannada Translation of '{text}']",
            SupportedLanguage.HI: f"[Hindi Translation of '{text}']",
            SupportedLanguage.TE: f"[Telugu Translation of '{text}']",
            SupportedLanguage.TA: f"[Tamil Translation of '{text}']",
            SupportedLanguage.ML: f"[Malayalam Translation of '{text}']",
            SupportedLanguage.MR: f"[Marathi Translation of '{text}']",
            SupportedLanguage.BN: f"[Bengali Translation of '{text}']",
            SupportedLanguage.EN: text,
        }
        translated_text = mock_translations.get(target_language, f"[{target_language.value.upper()} Translation: {text}]")
        return TranslateResponse(
            success=True,
            translated_text=translated_text,
            source_language=source_language,
            target_language=target_language
        )

    @staticmethod
    def tts(text: str, language: SupportedLanguage) -> TTSResponse:
        return TTSResponse(
            success=True,
            text=text,
            language=language,
            audio_url=f"/api/audio/mock_{language.value}_speech.mp3",
            audio_format="mp3",
            duration_seconds=round(max(1.5, len(text) * 0.08), 2)
        )
