import json
import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from app.config import settings
from app.models.schemas import (
    SupportedLanguage,
    TranslateResponse,
    AnalyzeResponse,
    FormField,
    RequiredDocument,
    ActionStep,
)

logger = logging.getLogger("govsahayak.translation")

TRANSLATION_SYSTEM_PROMPT = """
You are an expert translator specializing in Indian government documentation, public services, and citizen guidance.

CRITICAL TRANSLATION INSTRUCTION:
1. PRESERVE TERMINOLOGY: Retain proper names, numbers, Aadhaar/Ration Card IDs, dates, URLs, and official document titles (e.g. "Aadhaar Card", "Domicile Certificate", "Gazetted Officer", "Tehsil").
2. DO NOT MISLEAD: Do not translate official document names into misleading words.
3. ACCURACY: Do not invent, add, or omit information during translation.
4. TARGET LANGUAGE: Translate the text cleanly into the requested target language ({target_language}).
"""


class BaseTranslationProvider(ABC):
    """Abstract base class for translation providers."""

    @abstractmethod
    def translate(
        self,
        text: str,
        source_language: SupportedLanguage,
        target_language: SupportedLanguage
    ) -> Tuple[str, List[str]]:
        """Returns Tuple[translated_text, warnings_list]."""
        pass


class MockTranslationProvider(BaseTranslationProvider):
    """Deterministic, safe mock translation provider for development and hackathons."""

    # Sample mock translations for primary Indian languages (Hindi: hi, Kannada: kn)
    MOCK_VOCAB = {
        SupportedLanguage.KN: {
            "Government Service Application Form": "ಸರ್ಕಾರಿ ಸೇವಾ ಅರ್ಜಿ ನಮೂನೆ",
            "Full Name of Applicant": "ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು",
            "Aadhaar / National ID Number": "ಆಧಾರ್ / ರಾಷ್ಟ್ರೀಯ ಗುರುತಿನ ಸಂಖ್ಯೆ",
            "Annual Household Income": "ವಾರ್ಷಿಕ ಕೌಟುಂಬಿಕ ಆದಾಯ",
            "Aadhaar Card / Photo ID": "ಆಧಾರ್ ಕಾರ್ಡ್ / ಫೋಟೋ ಗುರುತಿನ ಚೀಟಿ",
            "Income Certificate / Salary Proof": "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ / ವೇತನ ಪುರಾವೆ",
            "Verify Eligibility & Gather Required Documents": "ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ",
            "Fill Form Fields Accurately": "ಅರ್ಜಿ ನಮೂನೆಯ ಕ್ಷೇತ್ರಗಳನ್ನು ನಿಖರವಾಗಿ ಭರ್ತಿ ಮಾಡಿ",
            "Submit Application & Retain Reference Number": "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿ ಮತ್ತು ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಇಟ್ಟುಕೊಳ್ಳಿ"
        },
        SupportedLanguage.HI: {
            "Government Service Application Form": "सरकारी सेवा आवेदन पत्र",
            "Full Name of Applicant": "आवेदक का पूरा नाम",
            "Aadhaar / National ID Number": "आधार / राष्ट्रीय पहचान संख्या",
            "Annual Household Income": "वार्षिक पारिवारिक आय",
            "Aadhaar Card / Photo ID": "आधार कार्ड / फोटो पहचान पत्र",
            "Income Certificate / Salary Proof": "आय प्रमाण पत्र / वेतन प्रमाण",
            "Verify Eligibility & Gather Required Documents": "पात्रता की जांच करें और आवश्यक दस्तावेज एकत्र करें",
            "Fill Form Fields Accurately": "आवेदन पत्र के क्षेत्रों को सटीक रूप से भरें",
            "Submit Application & Retain Reference Number": "आवेदन जमा करें और संदर्भ संख्या सुरक्षित रखें"
        }
    }

    def translate(
        self,
        text: str,
        source_language: SupportedLanguage,
        target_language: SupportedLanguage
    ) -> Tuple[str, List[str]]:
        warnings: List[str] = []

        if source_language == target_language:
            return text, warnings

        # Safe logging without exposing sensitive text content
        logger.info(f"Mocking translation from {source_language.value} to {target_language.value} (input len={len(text)})")

        vocab = self.MOCK_VOCAB.get(target_language, {})
        translated_text = text

        # Replace recognized terms while preserving proper names/numbers
        for src_phrase, tgt_phrase in vocab.items():
            if src_phrase in translated_text:
                translated_text = translated_text.replace(src_phrase, tgt_phrase)

        if translated_text == text and target_language not in (SupportedLanguage.EN, SupportedLanguage.HI, SupportedLanguage.KN):
            translated_text = f"[{target_language.value.upper()} Translation: {text}]"
            warnings.append(f"Translation to language '{target_language.value}' is generated with generic model fallback.")

        return translated_text, warnings


class GeminiTranslationProvider(BaseTranslationProvider):
    """Live Google Gemini API translation provider."""

    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name

    def translate(
        self,
        text: str,
        source_language: SupportedLanguage,
        target_language: SupportedLanguage
    ) -> Tuple[str, List[str]]:
        warnings: List[str] = []
        if source_language == target_language:
            return text, warnings

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            prompt = f"Source Language: {source_language.value}\nTarget Language: {target_language.value}\n\nText to Translate:\n{text}"

            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=TRANSLATION_SYSTEM_PROMPT.format(target_language=target_language.value),
                    temperature=0.1
                )
            )

            if not response.text:
                raise ValueError("Empty translation output from Gemini API.")

            return response.text.strip(), warnings

        except Exception as e:
            logger.error(f"Gemini translation failed: {e}", exc_info=True)
            warnings.append("AI Translation fallback triggered due to provider unavailability.")
            return text, warnings


class TranslationService:
    """Service wrapper managing translation operations and structured guidance translation."""

    def __init__(self, provider: Optional[BaseTranslationProvider] = None):
        if provider:
            self.provider = provider
        elif settings.AI_PROVIDER.lower() == "gemini" and settings.GEMINI_API_KEY:
            self.provider = GeminiTranslationProvider(
                api_key=settings.GEMINI_API_KEY,
                model_name=settings.AI_MODEL
            )
        else:
            self.provider = MockTranslationProvider()

    def translate_text(
        self,
        text: str,
        source_language: SupportedLanguage = SupportedLanguage.EN,
        target_language: SupportedLanguage = SupportedLanguage.KN
    ) -> TranslateResponse:
        """Translates single text string safely while masking sensitive logs."""
        if not text or not text.strip():
            raise ValueError("Translation text cannot be empty.")

        # Log string length only for privacy compliance
        logger.info(f"Processing text translation request (length={len(text)}, {source_language.value} -> {target_language.value})")

        translated_text, warnings = self.provider.translate(
            text=text.strip(),
            source_language=source_language,
            target_language=target_language
        )

        return TranslateResponse(
            success=True,
            translated_text=translated_text,
            source_language=source_language,
            target_language=target_language
        )

    def translate_analyze_response(
        self,
        analyze_res: AnalyzeResponse,
        target_language: SupportedLanguage
    ) -> AnalyzeResponse:
        """Translates all human-facing fields of structured AnalyzeResponse into target language."""
        if analyze_res.language == target_language:
            return analyze_res

        source_lang = analyze_res.language
        logger.info(f"Translating structured AnalyzeResponse from {source_lang.value} to {target_language.value}")

        # Translate main narrative text
        page_purpose_tr, _ = self.provider.translate(analyze_res.page_purpose, source_lang, target_language)
        simple_explanation_tr, _ = self.provider.translate(analyze_res.simple_explanation, source_lang, target_language)

        # Translate important information list
        important_info_tr = [
            self.provider.translate(item, source_lang, target_language)[0]
            for item in analyze_res.important_information
        ]

        # Translate fields
        translated_fields = []
        for field in analyze_res.fields:
            label_tr, _ = self.provider.translate(field.label, source_lang, target_language)
            desc_tr, _ = self.provider.translate(field.description, source_lang, target_language)
            translated_fields.append(
                FormField(
                    field_id=field.field_id,
                    label=label_tr,
                    description=desc_tr,
                    is_required=field.is_required,
                    example_input=field.example_input
                )
            )

        # Translate required documents (preserving document names)
        translated_docs = []
        for doc in analyze_res.required_documents:
            name_tr, _ = self.provider.translate(doc.name, source_lang, target_language)
            desc_tr, _ = self.provider.translate(doc.description, source_lang, target_language)
            translated_docs.append(
                RequiredDocument(
                    name=name_tr,
                    description=desc_tr,
                    is_mandatory=doc.is_mandatory
                )
            )

        # Translate steps
        translated_steps = []
        for step in analyze_res.steps:
            title_tr, _ = self.provider.translate(step.title, source_lang, target_language)
            desc_tr, _ = self.provider.translate(step.description, source_lang, target_language)
            translated_steps.append(
                ActionStep(
                    step_number=step.step_number,
                    title=title_tr,
                    description=desc_tr
                )
            )

        return AnalyzeResponse(
            success=analyze_res.success,
            page_purpose=page_purpose_tr,
            simple_explanation=simple_explanation_tr,
            important_information=important_info_tr,
            fields=translated_fields,
            required_documents=translated_docs,
            steps=translated_steps,
            warnings=analyze_res.warnings,
            unclear_information=analyze_res.unclear_information,
            language=target_language,
            ocr_metadata=analyze_res.ocr_metadata
        )
