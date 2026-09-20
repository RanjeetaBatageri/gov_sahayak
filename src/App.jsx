import { useState, useEffect, useRef } from 'react';
import './App.css';

// Centralized Language Configuration Mapping
const LANGUAGE_CONFIG = {
  en: { code: 'en', name: 'English', flag: '🌐', translationCode: 'en', ttsCode: 'en', locale: 'en-US' },
  hi: { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳', translationCode: 'hi', ttsCode: 'hi', locale: 'hi-IN' },
  bn: { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳', translationCode: 'bn', ttsCode: 'bn', locale: 'bn-IN' },
  mr: { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳', translationCode: 'mr', ttsCode: 'mr', locale: 'mr-IN' },
  te: { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳', translationCode: 'te', ttsCode: 'te', locale: 'te-IN' },
  ta: { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳', translationCode: 'ta', ttsCode: 'ta', locale: 'ta-IN' },
  gu: { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', translationCode: 'gu', ttsCode: 'gu', locale: 'gu-IN' },
  ur: { code: 'ur', name: 'اردو (Urdu)', flag: '🇮🇳', translationCode: 'ur', ttsCode: 'ur', locale: 'ur-IN' },
  kn: { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', translationCode: 'kn', ttsCode: 'kn', locale: 'kn-IN' },
  or: { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳', translationCode: 'or', ttsCode: 'or', locale: 'or-IN' },
  ml: { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳', translationCode: 'ml', ttsCode: 'ml', locale: 'ml-IN' },
  pa: { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', translationCode: 'pa', ttsCode: 'pa', locale: 'pa-IN' },
  as: { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳', translationCode: 'as', ttsCode: 'as', locale: 'as-IN' }
};

const MOCK_LANGUAGES = Object.values(LANGUAGE_CONFIG);

// Complete base structured templates
const MOCK_TRANSLATIONS = {
  en: {
    page_purpose: "Aadhaar Card Address Update Application Form (UIDAI)",
    simple_explanation: "This official government form is used to update or correct your residential address printed on your Aadhaar card. You need to upload standard proof of address documents like a Utility Bill, Voter ID, or Passport.",
    fields: [
      { name: "Full Name", explanation: "Enter your exact name as shown on your original Aadhaar card." },
      { name: "Aadhaar Number (12 Digits)", explanation: "Your unique 12-digit identification number printed on the front of your card." },
      { name: "New House/Door/Apartment No.", explanation: "Your new house number or flat number where you currently live." },
      { name: "Pincode", explanation: "6-digit postal area code of your new locality." },
      { name: "Document Reference No.", explanation: "Serial or reference number printed on your address proof document." }
    ],
    required_documents: [
      "Valid Proof of Address (Electricity bill / Water bill / Ration Card less than 3 months old)",
      "Existing Aadhaar Card copy",
      "Mobile number linked with Aadhaar (for OTP verification)"
    ],
    steps: [
      "Verify your 12-digit Aadhaar number and registered mobile phone.",
      "Fill in your updated street address and pincode carefully.",
      "Upload a clear photo or scanned PDF of your address proof document.",
      "Submit the form and make the nominal payment of ₹50.",
      "Save the 14-digit Update Request Number (URN) to track status."
    ],
    warnings: [
      "Ensure the name on your supporting address document matches your Aadhaar name exactly.",
      "Blurred or cropped document photos will lead to immediate application rejection."
    ],
    ocrText: "Form No. UIDAI-ADDR-01\nAPPLICATION FOR AADHAAR CARD ADDRESS UPDATE\n1. UID Number: [12 Digits]\n2. Resident Name:\n3. New Residential Address: House No / Street / Landmark / Pincode\n4. Supporting Document: Electricity Bill / Voter ID / Passport\n5. Fee: Rs. 50 (Non-refundable)"
  }
};

// Public Google Translate service helper
async function translateText(text, targetLang) {
  if (!text || !text.trim()) return '';
  if (targetLang === 'en' && /^[a-zA-Z0-9\s.,!?'"()-]+$/.test(text)) return text;
  
  try {
    const proxyUrl = `/translate-proxy?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    let res = await fetch(proxyUrl);
    if (!res.ok) {
      const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      res = await fetch(directUrl);
    }
    if (!res.ok) throw new Error(`Translation service returned status ${res.status}`);
    const data = await res.json();
    if (data && data[0] && Array.isArray(data[0])) {
      const translated = data[0]
        .map((item) => (Array.isArray(item) ? item[0] : ''))
        .filter(Boolean)
        .join('');
      if (translated && translated.trim()) return translated;
    }
    return text;
  } catch (err) {
    console.warn(`Translate fetch fallback for ${targetLang}:`, err);
    return text;
  }
}

// Translate full structured document dynamically into target language
async function translateStructuredDoc(baseDoc, targetLang) {
  if (!baseDoc) return null;
  if (targetLang === 'en') return baseDoc;

  try {
    const page_purpose = await translateText(baseDoc.page_purpose || '', targetLang);
    const simple_explanation = await translateText(baseDoc.simple_explanation || '', targetLang);

    const fields = await Promise.all(
      (baseDoc.fields || []).map(async (f) => ({
        name: await translateText(f.name || '', targetLang),
        explanation: await translateText(f.explanation || '', targetLang)
      }))
    );

    const required_documents = await Promise.all(
      (baseDoc.required_documents || []).map((doc) => translateText(doc || '', targetLang))
    );

    const steps = await Promise.all(
      (baseDoc.steps || []).map((step) => translateText(step || '', targetLang))
    );

    const warnings = await Promise.all(
      (baseDoc.warnings || []).map((warn) => translateText(warn || '', targetLang))
    );

    return {
      success: true,
      page_purpose,
      simple_explanation,
      fields,
      required_documents,
      steps,
      warnings,
      ocrText: baseDoc.ocrText
    };
  } catch (err) {
    console.warn(`Failed to translate structured document to ${targetLang}`, err);
    return baseDoc;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = {
  async analyze(data) {
    const targetLang = data.target_language || 'en';
    try {
      const formData = new FormData();
      if (data.image) formData.append('image', data.image);
      if (data.text) formData.append('text', data.text);
      formData.append('target_language', targetLang);

      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`Analysis failed with status ${res.status}`);
      const json = await res.json();
      return json;
    } catch {
      // Offline / Client-side dynamic translation
      const baseDoc = MOCK_TRANSLATIONS.en;

      if (data.text && data.text.trim()) {
        const translatedPurpose = await translateText("Government Document Summary", targetLang);
        const translatedExplanation = await translateText(data.text, targetLang);
        return {
          success: true,
          page_purpose: translatedPurpose,
          simple_explanation: translatedExplanation,
          fields: [
            {
              name: await translateText("Extracted Form Detail", targetLang),
              explanation: await translateText(data.text.slice(0, 100), targetLang)
            }
          ],
          required_documents: [
            await translateText("Valid identity/address document as mentioned in text", targetLang)
          ],
          steps: [
            await translateText("Review requirements above carefully.", targetLang),
            await translateText("Submit form with required attachments.", targetLang)
          ],
          warnings: [
            await translateText("Ensure all details are accurate before submitting.", targetLang)
          ],
          ocrText: data.text
        };
      }

      const translatedDoc = await translateStructuredDoc(baseDoc, targetLang);
      return {
        ...translatedDoc,
        ocrText: data.text || baseDoc.ocrText
      };
    }
  },

  async tts(text, languageCode) {
    const langConfig = LANGUAGE_CONFIG[languageCode] || LANGUAGE_CONFIG.en;
    const ttsCode = langConfig.ttsCode || languageCode;
    console.log("TTS text:", text);
    console.log("TTS language:", ttsCode);

    // 1. Local Vite server proxy (bypasses browser CORS & Referer restrictions)
    try {
      const proxyUrl = `/tts-proxy?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${ttsCode}&client=tw-ob`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          return URL.createObjectURL(blob);
        }
      }
    } catch (err) {
      console.warn('Vite proxy TTS fetch failed, attempting CORS proxy:', err);
    }

    // 2. CORS Proxy fallback
    try {
      const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${ttsCode}&client=tw-ob`;
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
      const res = await fetch(corsProxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          return URL.createObjectURL(blob);
        }
      }
    } catch (err) {
      console.warn('CORS proxy TTS fetch failed:', err);
    }

    return null;
  }
};

export default function App() {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [inputTab, setInputTab] = useState('upload');
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Explicitly separate OCR text and Translated Result
  const [ocrText, setOcrText] = useState(null);
  const [translatedResult, setTranslatedResult] = useState(null);
  const [error, setError] = useState(null);
  const [showOcrDetails, setShowOcrDetails] = useState(false);

  // Theme state: default light mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Audio & Voice States
  const [activeAudioKey, setActiveAudioKey] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioLabel, setAudioLabel] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const audioRef = useRef(null);
  const createdUrlsRef = useRef([]);

  // Interactive Checklist & Field States
  const [checkedDocs, setCheckedDocs] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});
  const [fieldFilter, setFieldFilter] = useState('');

  const revokeUrls = () => {
    createdUrlsRef.current.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch {}
    });
    createdUrlsRef.current = [];
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    revokeUrls();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudioKey(null);
    setIsAudioLoading(false);
    setAudioLabel('');
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleLanguageChange = async (newLang) => {
    setSelectedLang(newLang);
    stopAudio();
    setAudioError(null);

    if (translatedResult || ocrText) {
      setLoading(true);
      try {
        const res = await api.analyze({
          image: selectedImage,
          text: ocrText || textInput,
          target_language: newLang
        });
        setTranslatedResult(res);
        if (res.ocrText) setOcrText(res.ocrText);
      } catch (err) {
        setError(`Translation error: ${err.message || 'Failed to update language'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Split text into chunks for TTS limits (~140 chars)
  const splitIntoChunks = (text, maxLen = 140) => {
    const sentences = text.match(/[^.!?।॥\n]+[.!?।॥\n]*/g) || [text];
    const chunks = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length <= maxLen) {
        current += sentence;
      } else {
        if (current.trim()) chunks.push(current.trim());
        if (sentence.length > maxLen) {
          const words = sentence.split(/\s+/);
          current = '';
          for (const word of words) {
            if ((current + ' ' + word).length <= maxLen) {
              current = (current + ' ' + word).trim();
            } else {
              if (current.trim()) chunks.push(current.trim());
              current = word;
            }
          }
        } else {
          current = sentence;
        }
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  };

  const speakText = async (textToSpeak, key, label) => {
    if (!textToSpeak || !textToSpeak.trim()) {
      setAudioError('No translated text available to speak.');
      return;
    }

    if (activeAudioKey === key && (isPlayingAudio || isAudioLoading)) {
      stopAudio();
      return;
    }

    stopAudio();
    setAudioError(null);
    setActiveAudioKey(key);
    setIsAudioLoading(true);
    setAudioLabel(label || textToSpeak.slice(0, 40) + '...');

    // Instantiating HTMLAudioElement immediately within user gesture context
    const audio = new Audio();
    audioRef.current = audio;

    const langConfig = LANGUAGE_CONFIG[selectedLang] || LANGUAGE_CONFIG.hi;
    const cleanText = textToSpeak.replace(/\s+/g, ' ').trim();
    const chunks = splitIntoChunks(cleanText, 140);
    const ttsCode = langConfig.ttsCode || langConfig.code;

    // MANDATORY DEBUGGING LOGS
    console.log("OCR text:", ocrText);
    console.log("Translated text:", textToSpeak);
    console.log("Selected language:", selectedLang);
    console.log("TTS text:", cleanText);
    console.log("TTS language:", ttsCode);

    let currentChunkIdx = 0;

    const playNextChunk = async () => {
      if (currentChunkIdx >= chunks.length) {
        stopAudio();
        return;
      }

      const chunkText = chunks[currentChunkIdx];
      currentChunkIdx++;

      try {
        const audioUrl = await api.tts(chunkText, ttsCode);
        if (!audioUrl) {
          throw new Error('TTS audio Blob generation failed.');
        }

        createdUrlsRef.current.push(audioUrl);

        audio.src = audioUrl;
        audio.playbackRate = speechRate;

        audio.oncanplaythrough = () => {
          setIsAudioLoading(false);
          setIsPlayingAudio(true);
        };

        audio.onended = () => {
          playNextChunk();
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error on chunk, attempting browser fallback:', e);
          fallbackBrowserSpeech(cleanText, langConfig);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        setIsAudioLoading(false);
        setIsPlayingAudio(true);
      } catch (err) {
        console.warn('Audio play exception:', err);
        fallbackBrowserSpeech(cleanText, langConfig);
      }
    };

    await playNextChunk();
  };

  const fallbackBrowserSpeech = (cleanText, langConfig) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      utterance.lang = langConfig.locale || 'hi-IN';
      utterance.rate = speechRate;

      const voices = window.speechSynthesis.getVoices();
      const regionalVoice = voices.find(
        (v) => v.lang.toLowerCase() === langConfig.locale.toLowerCase() ||
               v.lang.toLowerCase().startsWith(langConfig.code.toLowerCase())
      );
      if (regionalVoice) {
        utterance.voice = regionalVoice;
      }

      utterance.onstart = () => {
        setIsAudioLoading(false);
        setIsPlayingAudio(true);
      };
      utterance.onend = () => {
        stopAudio();
      };
      utterance.onerror = () => {
        stopAudio();
        setAudioError('Audio generation/playback failed for this text.');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      stopAudio();
      setAudioError('Audio playback is not supported on this browser.');
    }
  };

  const speakFullOverview = () => {
    if (!translatedResult) {
      setAudioError('No translated text available to speak.');
      return;
    }
    const overviewSpeechText = [
      translatedResult.page_purpose,
      translatedResult.simple_explanation,
      translatedResult.steps && translatedResult.steps.length > 0 ? 'Steps to follow: ' + translatedResult.steps.join('. ') : ''
    ].filter(Boolean).join('. ');

    if (!overviewSpeechText.trim()) {
      setAudioError('No translated text available to speak.');
      return;
    }

    speakText(overviewSpeechText, 'full_overview', 'Full Document Voice Guide');
  };

  const toggleDocCheck = (idx) => {
    setCheckedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStepComplete = (idx) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const loadSampleDemo = () => {
    setInputTab('text');
    const sample = "Form No. UIDAI-ADDR-01: Application for Aadhaar Address Update. Please provide 12-digit UID, new residence address with 6-digit Pincode, and upload valid proof of address (Utility bill less than 3 months old). Fee ₹50.";
    setTextInput(sample);
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      stopAudio();
    }
  };

  const handleAnalyze = async () => {
    if (inputTab === 'upload' && !selectedImage) {
      setError('Please upload or snap a photo of a government form or document.');
      return;
    }
    if (inputTab === 'text' && !textInput.trim()) {
      setError('Please paste or type text from the government portal or form.');
      return;
    }

    setLoading(true);
    setError(null);
    stopAudio();

    try {
      const res = await api.analyze({
        image: selectedImage,
        text: textInput,
        target_language: selectedLang
      });

      if (res && res.success !== false) {
        setTranslatedResult(res);
        setOcrText(res.ocrText || (inputTab === 'text' ? textInput : 'Document OCR processed successfully.'));
        setCheckedDocs({});
        setCompletedSteps({});
      } else {
        throw new Error(res?.message || 'Analysis returned invalid result.');
      }
    } catch (err) {
      setError(`Failed to analyze document (${err.message || 'Network Error'}). Using fallback offline translation.`);
      const fallback = MOCK_TRANSLATIONS[selectedLang] || MOCK_TRANSLATIONS.en;
      setTranslatedResult({
        success: true,
        ...fallback
      });
      setOcrText(fallback.ocrText || textInput);
    } finally {
      setLoading(false);
    }
  };

  const filteredFields = translatedResult?.fields?.filter((f) =>
    f.name.toLowerCase().includes(fieldFilter.toLowerCase()) ||
    f.explanation.toLowerCase().includes(fieldFilter.toLowerCase())
  ) || [];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 flex flex-col overflow-x-hidden ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
    }`}>
      
      {/* Top National Portal Tricolor Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md shadow-sm transition-colors ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-blue-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center font-extrabold text-white text-lg shadow-md tracking-tight shrink-0 border border-blue-700">
              Gov
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-blue-950 dark:text-blue-300">
                  GovSahayak
                </h1>
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-900/70 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                  Government Portal Voice Assistant
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Simplified Multi-Lingual Representation & Audio Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5">
              <label htmlFor="language-select" className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-blue-950'}`}>
                🌐 Language:
              </label>
              <select
                id="language-select"
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`font-bold rounded-xl text-xs sm:text-sm px-3 py-1.5 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer transition border ${
                  isDarkMode
                    ? 'bg-slate-900 border-blue-500/60 text-blue-300'
                    : 'bg-blue-50/80 border-blue-300 text-blue-950 hover:bg-blue-100'
                }`}
              >
                {MOCK_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Light/Dark Theme"
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border transition flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-blue-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      {/* Active Audio Player Bar */}
      {(isPlayingAudio || isAudioLoading) && (
        <div className={`sticky top-[61px] z-40 border-b px-4 py-2 transition-all animate-fade-in shadow-md ${
          isDarkMode ? 'bg-blue-950/90 border-blue-700 text-blue-100' : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-4 text-blue-700 dark:text-blue-400">
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
              </div>
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                {isAudioLoading ? '⏳ Generating Audio...' : '🔊 Playing Voice Guide:'}
              </span>
              <span className="text-xs font-medium truncate max-w-[200px] sm:max-w-md italic">
                "{audioLabel}" ({LANGUAGE_CONFIG[selectedLang]?.name})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed controls */}
              <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-blue-300 dark:border-blue-700">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Speed:</span>
                {[0.8, 1.0, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setSpeechRate(speed);
                      if (audioRef.current) audioRef.current.playbackRate = speed;
                    }}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      speechRate === speed
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Stop Button */}
              <button
                onClick={stopAudio}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-bold text-xs shadow transition flex items-center gap-1"
              >
                ⏹️ Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container - Fully Responsive Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Input & Form Tab Controls */}
          <div className="lg:col-span-5 space-y-6">
            <section className={`border rounded-2xl p-5 shadow-sm transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 mb-4 flex-wrap gap-2 border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputTab('upload')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                      inputTab === 'upload'
                        ? 'bg-blue-800 text-white shadow'
                        : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📷 Upload Image
                  </button>
                  <button
                    onClick={() => setInputTab('text')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                      inputTab === 'text'
                        ? 'bg-blue-800 text-white shadow'
                        : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ✏️ Paste Text
                  </button>
                </div>

                <button
                  onClick={loadSampleDemo}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1 ${
                    isDarkMode
                      ? 'bg-slate-800 border-blue-500/40 text-blue-300 hover:bg-slate-700'
                      : 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  ⚡ Sample Demo
                </button>
              </div>

              {/* Upload Area */}
              {inputTab === 'upload' ? (
                <div className="space-y-3">
                  <div className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                    isDarkMode
                      ? 'border-blue-500/30 hover:border-blue-400 bg-slate-950/40'
                      : 'border-blue-300 hover:border-blue-500 bg-blue-50/40'
                  }`}>
                    {imagePreview ? (
                      <div className="space-y-3 w-full">
                        <img
                          src={imagePreview}
                          alt="Government Page Preview"
                          className="max-h-64 w-full rounded-lg border border-slate-300 dark:border-slate-700 object-contain shadow-sm bg-slate-900/5 dark:bg-slate-900"
                        />
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          ✓ Image loaded for multi-lingual OCR & Voice analysis
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto text-2xl">
                          📄
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            Upload photo or screenshot of any Indian Govt Form
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Supports Aadhaar, Passport, Ration Card, Voter ID, etc.
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="screenshot-input"
                    />
                    <label
                      htmlFor="screenshot-input"
                      className="cursor-pointer bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition inline-block"
                    >
                      {imagePreview ? 'Change Image' : 'Browse File'}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste government portal text or form requirements here..."
                    className={`w-full rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition border ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  ></textarea>
                </div>
              )}

              {error && (
                <div className="mt-3 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-700 rounded-xl p-3 text-red-800 dark:text-red-200 text-xs font-medium flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 w-full py-3 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Analyzing for {LANGUAGE_CONFIG[selectedLang]?.name}...</span>
                  </>
                ) : (
                  <>
                    <span>🔍 Analyze & Voice Guide</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {LANGUAGE_CONFIG[selectedLang]?.name}
                    </span>
                  </>
                )}
              </button>
            </section>

            {/* Extracted Raw OCR Card */}
            {ocrText && (
              <div className={`border rounded-2xl p-4 shadow-sm transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>🔤 Extracted OCR Source Text</span>
                  </span>
                  <button
                    onClick={() => setShowOcrDetails(!showOcrDetails)}
                    className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    {showOcrDetails ? 'Hide OCR' : 'View Raw OCR'}
                  </button>
                </div>
                {showOcrDetails && (
                  <pre className={`mt-3 p-3 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {ocrText}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Results & Multilingual Audio Guide */}
          <div className="lg:col-span-7">
            {translatedResult ? (
              <section className={`border rounded-2xl p-5 shadow-sm space-y-6 animate-fade-in transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                
                {/* Audio Error Alert */}
                {audioError && (
                  <div className="bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-xl p-3 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{audioError}</span>
                    </span>
                    <button onClick={() => setAudioError(null)} className="text-xs font-bold hover:underline">
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Overview Banner & Voice Walkthrough Button */}
                <div className={`border rounded-2xl p-4 transition-all ${
                  activeAudioKey === 'full_overview'
                    ? 'ring-2 ring-blue-600 bg-blue-50/90 dark:bg-blue-950/50'
                    : isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-blue-50/60 border-blue-200/80'
                }`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-blue-900 text-white uppercase tracking-wider">
                          Official Purpose ({LANGUAGE_CONFIG[selectedLang]?.name})
                        </span>
                        {activeAudioKey === 'full_overview' && (
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 animate-pulse flex items-center gap-1">
                            🔊 Speaking now...
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg sm:text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-blue-950'}`}>
                        {translatedResult.page_purpose}
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {translatedResult.simple_explanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={speakFullOverview}
                        disabled={isAudioLoading}
                        className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition flex items-center gap-2 border ${
                          activeAudioKey === 'full_overview'
                            ? 'bg-red-600 text-white border-red-700'
                            : 'bg-blue-800 hover:bg-blue-900 text-white border-blue-900'
                        }`}
                      >
                        <span>
                          {activeAudioKey === 'full_overview'
                            ? '⏹️ Stop Voice Overview'
                            : `🔊 Listen in ${LANGUAGE_CONFIG[selectedLang]?.name}`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Checklist Representation */}
                {translatedResult.required_documents && translatedResult.required_documents.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <span>📋 Required Documents Checklist</span>
                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          {Object.values(checkedDocs).filter(Boolean).length} / {translatedResult.required_documents.length} Ready
                        </span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {translatedResult.required_documents.map((doc, idx) => {
                        const docKey = `doc-${idx}`;
                        const isChecked = !!checkedDocs[idx];
                        const isSpeaking = activeAudioKey === docKey;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                              isSpeaking
                                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-300'
                                : isChecked
                                ? isDarkMode ? 'bg-emerald-950/30 border-emerald-800/80' : 'bg-emerald-50/80 border-emerald-300'
                                : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                            }`}
                          >
                            <label className="flex items-start gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleDocCheck(idx)}
                                className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer rounded shrink-0"
                              />
                              <div>
                                <span className={`text-xs sm:text-sm font-semibold block ${
                                  isChecked
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : isDarkMode ? 'text-slate-200' : 'text-slate-800'
                                }`}>
                                  {doc}
                                </span>
                              </div>
                            </label>

                            <button
                              onClick={() => speakText(doc, docKey, `Document requirement: ${doc}`)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition shrink-0 ${
                                isSpeaking
                                  ? 'bg-blue-800 text-white border-blue-900'
                                  : isDarkMode
                                  ? 'bg-slate-800 text-blue-300 border-slate-700 hover:bg-slate-700'
                                  : 'bg-white text-blue-900 border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              🔊 {isSpeaking ? 'Stop' : 'Listen'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Interactive Step-by-Step Guidance */}
                {translatedResult.steps && translatedResult.steps.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <span>🪜 Guided Step-by-Step Procedure</span>
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {translatedResult.steps.map((step, idx) => {
                        const stepKey = `step-${idx}`;
                        const isDone = !!completedSteps[idx];
                        const isSpeaking = activeAudioKey === stepKey;

                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                              isSpeaking
                                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-300'
                                : isDone
                                ? isDarkMode ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-emerald-50/50 border-emerald-300'
                                : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <button
                                onClick={() => toggleStepComplete(idx)}
                                className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-blue-800 text-white'
                                }`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </button>
                              <div>
                                <p className={`text-xs sm:text-sm font-medium ${
                                  isDone ? 'line-through text-slate-400 dark:text-slate-500' : isDarkMode ? 'text-slate-200' : 'text-slate-800'
                                }`}>
                                  {step}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => speakText(`Step ${idx + 1}: ${step}`, stepKey, `Step ${idx + 1}: ${step}`)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition shrink-0 ${
                                isSpeaking
                                  ? 'bg-blue-800 text-white border-blue-900'
                                  : isDarkMode
                                  ? 'bg-slate-800 text-blue-300 border-slate-700 hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              🔊 {isSpeaking ? 'Stop' : 'Listen'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form Fields Explanation Representation */}
                {translatedResult.fields && translatedResult.fields.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <span>✏️ Form Fields Guide</span>
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                          ({filteredFields.length} fields)
                        </span>
                      </h3>

                      {/* Filter Input */}
                      <input
                        type="text"
                        placeholder="Search field..."
                        value={fieldFilter}
                        onChange={(e) => setFieldFilter(e.target.value)}
                        className={`text-xs px-3 py-1 rounded-lg border outline-none transition ${
                          isDarkMode
                            ? 'bg-slate-950 border-slate-700 text-slate-200'
                            : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredFields.map((field, idx) => {
                        const fieldKey = `field-${idx}`;
                        const isSpeaking = activeAudioKey === fieldKey;

                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border transition space-y-1.5 ${
                              isSpeaking
                                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-300'
                                : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-900 dark:text-blue-300 text-xs sm:text-sm">
                                {field.name}
                              </span>
                              <button
                                onClick={() => speakText(`${field.name}: ${field.explanation}`, fieldKey, `Field: ${field.name}`)}
                                className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold border transition ${
                                  isSpeaking
                                    ? 'bg-blue-800 text-white border-blue-900'
                                    : 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-200'
                                }`}
                              >
                                🔊 {isSpeaking ? 'Stop' : 'Listen'}
                              </button>
                            </div>
                            <p className={`text-xs leading-normal ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                              {field.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Important Warnings Representation */}
                {translatedResult.warnings && translatedResult.warnings.length > 0 && (
                  <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <span>⚠️ Important Safety Warnings</span>
                      </h3>
                      <button
                        onClick={() => speakText(`Important Warnings: ${translatedResult.warnings.join('. ')}`, 'warnings', 'Safety Warnings')}
                        className="text-[11px] sm:text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
                      >
                        🔊 Listen Warnings
                      </button>
                    </div>
                    <ul className="space-y-1.5">
                      {translatedResult.warnings.map((warn, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 flex items-start gap-2">
                          <span className="text-amber-600 font-bold shrink-0">!</span>
                          <span>{warn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ) : (
              <div className={`border rounded-2xl p-10 text-center space-y-3 transition-colors ${
                isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
              }`}>
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto text-3xl">
                  🎧
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">
                  Ready for Govt Form Multi-lingual Analysis
                </h3>
                <p className="text-xs max-w-md mx-auto text-slate-600 dark:text-slate-400">
                  Upload an image of any government application form or paste portal requirements on the left to generate simplified explanations and voice guidance in your chosen Indian language.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
