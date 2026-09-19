from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SupportedLanguage(str, Enum):
    EN = "en"  # English
    HI = "hi"  # Hindi
    KN = "kn"  # Kannada
    TE = "te"  # Telugu
    TA = "ta"  # Tamil
    ML = "ml"  # Malayalam
    MR = "mr"  # Marathi
    BN = "bn"  # Bengali


LANGUAGE_DETAILS = [
    {"code": SupportedLanguage.EN, "name": "English", "native_name": "English"},
    {"code": SupportedLanguage.HI, "name": "Hindi", "native_name": "हिन्दी"},
    {"code": SupportedLanguage.KN, "name": "Kannada", "native_name": "ಕನ್ನಡ"},
    {"code": SupportedLanguage.TE, "name": "Telugu", "native_name": "తెలుగు"},
    {"code": SupportedLanguage.TA, "name": "Tamil", "native_name": "தமிழ்"},
    {"code": SupportedLanguage.ML, "name": "Malayalam", "native_name": "മലയാളം"},
    {"code": SupportedLanguage.MR, "name": "Marathi", "native_name": "मराठी"},
    {"code": SupportedLanguage.BN, "name": "Bengali", "native_name": "বাংলা"},
]


class LanguageItem(BaseModel):
    code: SupportedLanguage
    name: str
    native_name: str


class LanguagesResponse(BaseModel):
    success: bool = True
    languages: List[LanguageItem]


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Extracted webpage text or form content")
    url: Optional[str] = Field(None, description="Optional target web page URL")
    language: SupportedLanguage = Field(SupportedLanguage.EN, description="Target response language")

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Text content must not be empty or whitespace only.")
        return v.strip()


class FormField(BaseModel):
    field_id: str = Field(..., description="Machine-readable field key or ID")
    label: str = Field(..., description="Citizen-friendly label for the field")
    description: str = Field(..., description="Explanation of what this field means and how to fill it")
    is_required: bool = Field(True, description="Whether filling this field is mandatory")
    example_input: Optional[str] = Field(None, description="Sample valid input format")


class RequiredDocument(BaseModel):
    name: str = Field(..., description="Official document name")
    description: str = Field(..., description="Purpose and document requirements")
    is_mandatory: bool = Field(True, description="Whether the document is mandatory")


class ActionStep(BaseModel):
    step_number: int = Field(..., description="Sequential step number")
    title: str = Field(..., description="Action step title")
    description: str = Field(..., description="Detailed instructions for this step")


class OCRMetadata(BaseModel):
    ocr_applied: bool = True
    confidence: float = Field(..., description="OCR confidence score between 0.0 and 1.0")
    extracted_text: str = Field(..., description="Text extracted via OCR")
    warnings: List[str] = Field(default_factory=list, description="Any OCR warnings or low confidence notices")


class AnalyzeResponse(BaseModel):
    success: bool = True
    page_purpose: str = Field(..., description="Summary of what the page or form is for")
    simple_explanation: str = Field(..., description="Simplification of complicated official language into easy language")
    important_information: List[str] = Field(default_factory=list, description="Key rules, limits, or general notices explicitly found in text")
    fields: List[FormField] = Field(default_factory=list, description="Form fields identified and explained")
    required_documents: List[RequiredDocument] = Field(default_factory=list, description="Documents explicitly mentioned by source text")
    steps: List[ActionStep] = Field(default_factory=list, description="Explicit instructions converted into numbered steps")
    warnings: List[str] = Field(default_factory=list, description="Safety warnings or warnings when source is incomplete/unclear")
    unclear_information: List[str] = Field(default_factory=list, description="Fields, fees, deadlines, or rules not specified in source text")
    language: SupportedLanguage = SupportedLanguage.EN
    ocr_metadata: Optional[OCRMetadata] = None


class ExplainRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Legal/government text to be simplified")
    language: SupportedLanguage = Field(SupportedLanguage.EN, description="Target response language")

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Text content must not be empty or whitespace only.")
        return v.strip()


class ExplainResponse(BaseModel):
    success: bool = True
    original_text: str
    simple_explanation: str
    language: SupportedLanguage
    warnings: List[str] = []


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to translate")
    source_language: SupportedLanguage = Field(SupportedLanguage.EN, description="Source language code")
    target_language: SupportedLanguage = Field(SupportedLanguage.KN, description="Target language code")

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Text content must not be empty or whitespace only.")
        return v.strip()


class TranslateResponse(BaseModel):
    success: bool = True
    translated_text: str
    source_language: SupportedLanguage
    target_language: SupportedLanguage


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    language: SupportedLanguage = Field(SupportedLanguage.KN, description="Target audio language code")

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Text content must not be empty or whitespace only.")
        return v.strip()


class TTSResponse(BaseModel):
    success: bool = True
    text: str
    language: SupportedLanguage
    audio_url: str
    audio_format: str = "mp3"
    duration_seconds: float = 3.5
