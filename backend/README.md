# GovSahayak Backend API Service

GovSahayak is an AI-powered advisory assistant designed to help Indian citizens navigate, understand, and complete complex government service portals and application forms.

---

## Architecture Overview

```text
                                [ Citizen Input ]
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                 [ Screenshot File ]            [ Raw Form Text ]
                         │                             │
                         ▼                             │
                ┌──────────────────┐                   │
                │    OCR Service   │                   │
                └────────┬─────────┘                   │
                         │ (Extracted Text)            │
                         └──────────────┬──────────────┘
                                        ▼
                        ┌──────────────────────────────┐
                        │ AI Page-Understanding Engine │
                        │  (Anti-Prompt-Injection Frame)│
                        └──────────────┬───────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │ Multilingual Translation Svc │
                        └──────────────┬───────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │ Text-to-Speech (TTS) Service │
                        └──────────────┬───────────────┘
                                       ▼
                         [ Citizen Structured Response ]
```

---

## 🛠️ Setup & Installation

### Prerequisites
- **Python**: Version `3.11` or higher.

### Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `"GovSahayak Backend"` | FastAPI Application Name. |
| `APP_ENV` | `"development"` | Application runtime environment (`development` / `production`). |
| `DEBUG` | `True` | FastAPI debug mode flag. |
| `HOST` | `"127.0.0.1"` | Host address for Uvicorn server. |
| `PORT` | `8000` | Port number for Uvicorn server. |
| `CORS_ORIGINS` | `["http://localhost:3000", ...]` | Allowed CORS origin endpoints. |
| `LOG_LEVEL` | `"INFO"` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `AI_PROVIDER` | `"mock"` | AI engine provider (`mock` for offline/hackathon, `gemini` for live API). |
| `AI_MODEL` | `"gemini-2.5-flash"` | Gemini model identifier. |
| `GEMINI_API_KEY` | `""` | Google Gemini API Key (optional when using `AI_PROVIDER=mock`). |

---

## Running the Server & Tests

### Start Backend Development Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Interactive API Documentation will be available at:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

### Execute Automated Test Suite

```bash
.\.venv\Scripts\pytest
```

---

## API Documentation & Contract Examples

### Supported Languages
- `en`: English
- `hi`: Hindi (हिन्दी)
- `kn`: Kannada (ಕನ್ನಡ)
- `te`: Telugu (తెలుగు)
- `ta`: Tamil (தமிழ்)
- `ml`: Malayalam (മലയാളം)
- `mr`: Marathi (मराठी)
- `bn`: Bengali (বাংলা)

---

### 1. System Health Check
`GET /api/health`

**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "app_name": "GovSahayak Backend",
  "environment": "development",
  "timestamp": "2026-09-18T12:00:00.000000+00:00"
}
```

---

### 2. Supported Languages List
`GET /api/languages`

**Response (`200 OK`)**:
```json
{
  "success": true,
  "languages": [
    { "code": "en", "name": "English", "native_name": "English" },
    { "code": "hi", "name": "Hindi", "native_name": "हिन्दी" },
    { "code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ" }
  ]
}
```

---

### 3. Page & Screenshot Analysis
`POST /api/analyze`

**Request Body (`application/json`)**:
```json
{
  "text": "Government of Karnataka Revenue Department. Application for Income Certificate. Applicant Name: Ramesh Kumar. Aadhaar ID: 1234-5678-9012.",
  "language": "kn"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "page_purpose": "ಸರ್ಕಾರಿ ಸೇವಾ ಅರ್ಜಿ ನಮೂನೆ",
  "simple_explanation": "This government page helps citizens apply for official certificates...",
  "important_information": [
    "All details filled in the application form must strictly match your official government photo ID."
  ],
  "fields": [
    {
      "field_id": "applicant_name",
      "label": "ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು",
      "description": "Enter your complete legal name matching your government photo ID.",
      "is_required": true,
      "example_input": "Ramesh Kumar"
    }
  ],
  "required_documents": [
    {
      "name": "ಆಧಾರ್ ಕಾರ್ಡ್ / ಫೋಟೋ ಗುರುತಿನ ಚೀಟಿ",
      "description": "Identity proof explicitly referenced in form content.",
      "is_mandatory": true
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ",
      "description": "Check that you possess clear copies of all required documents."
    }
  ],
  "warnings": [
    "This guidance is generated for informational reference only."
  ],
  "unclear_information": [
    "Application Fee: Not specified in source document"
  ],
  "language": "kn",
  "ocr_metadata": null
}
```

---

### 4. Text Simplification / Explanation
`POST /api/explain`

**Request Body (`application/json`)**:
```json
{
  "text": "The applicant must produce a bonafide domicile certificate attested by a Gazetted Officer.",
  "language": "en"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "original_text": "The applicant must produce a bonafide domicile certificate attested by a Gazetted Officer.",
  "simple_explanation": "In simple terms: You need to submit your application along with required identity proof to your local Seva Kendra office within 30 days.",
  "language": "en",
  "warnings": [
    "This simplified explanation is generated for informational guidance only."
  ]
}
```

---

### 5. Multilingual Translation
`POST /api/translate`

**Request Body (`application/json`)**:
```json
{
  "text": "Full Name of Applicant",
  "source_language": "en",
  "target_language": "kn"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "translated_text": "ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು",
  "source_language": "en",
  "target_language": "kn"
}
```

---

### 6. Text-to-Speech (TTS)
`POST /api/tts`

**Request Body (`application/json`)**:
```json
{
  "text": "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
  "language": "kn"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "text": "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
  "language": "kn",
  "audio_url": "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAAMTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA...",
  "audio_format": "mp3",
  "duration_seconds": 3.28
}
```

---

## 🔒 Security & Privacy Guarantees

1. **Advisory Boundaries**: GovSahayak is strictly advisory. It **never** executes web browser clicks, form submissions, or login automation, and never makes binding eligibility decisions.
2. **Ephemeral Screenshot Lifecycle**: Uploaded screenshots are stored ONLY in temporary OS RAM/buffers during OCR processing and **deleted immediately** in `try...finally` blocks. Files are **never permanently saved**.
3. **Anti-Prompt-Injection Safeguards**: Source webpage text is isolated inside `<untrusted_government_page_text>` XML tags. Malicious injection text inside form pages is neutralized.
4. **Non-Hallucination Policy**: If deadlines, fees, or rules are not in the source text, they are listed under `unclear_information` as *"Not specified in source document"*.
5. **Log Privacy Masking**: Sensitive user text is never logged to stdout or file logs. Only text character lengths are recorded.

---

## Known Limitations

- **OCR Binary Fallback**: Default OCR provider operates in safe hackathon mode without requiring native Windows Tesseract binary installations.
- **Mock Service Mode**: Default `.env` setting `AI_PROVIDER=mock` provides deterministic responses for offline hackathon demos. Set `AI_PROVIDER=gemini` and supply `GEMINI_API_KEY` for live model inference.

---

## 💡 Hackathon Demo Instructions

1. Start server on local machine:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
2. Open interactive Swagger docs at `http://127.0.0.1:8000/docs`.
3. Try `POST /api/analyze` with `language: "kn"` or upload a sample screenshot.
4. Call `POST /api/tts` to hear base64 MP3 audio speech output.
