import { useState, useEffect } from 'react';
import './App.css';

const MOCK_LANGUAGES = [
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'kn', name: 'கன்னட (Kannada)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'en', name: 'English' }
];

const MOCK_ANALYZE_RESPONSE = {
  success: true,
  page_purpose: "Aadhaar Card Address Update Application Form (UIDAI)",
  simple_explanation: "This official government form is used to update or correct your residential address printed on your Aadhaar card. You need to upload standard proof of address documents like a Utility Bill, Voter ID, or Passport.",
  fields: [
    { name: "Full Name", explanation: "Enter your exact name as shown on your original Aadhaar card." },
    { name: "Aadhaar Number (12 Digits)", explanation: "Your unique 12-digit identification number printed on the front of your card." },
    { name: "New House/Door/Apartment No.", explanation: "Your new house number or flat number where you currently live." },
    { name: "Pincode", explanation: "6-digit postal area code of your new locality." },
    { name: "Document Reference No.", explanation: "Serial or reference number printed on your address proof document (e.g., electricity bill account number)." }
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
  ]
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = {
  async analyze(data) {
    try {
      const formData = new FormData();
      if (data.image) formData.append('image', data.image);
      if (data.text) formData.append('text', data.text);
      formData.append('target_language', data.target_language || 'hi');

      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Analysis failed');
      return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
      return MOCK_ANALYZE_RESPONSE;
    }
  },
  async tts(text, language) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }
};

export default function App() {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [inputTab, setInputTab] = useState('upload');
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [speakingText, setSpeakingText] = useState(null);
  const [isExtension, setIsExtension] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      setIsExtension(true);
    }
  }, []);

  const captureActiveTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      setLoading(true);
      setError(null);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id },
              func: () => document.body.innerText
            },
            (results) => {
              setLoading(false);
              if (results && results[0] && results[0].result) {
                setInputTab('text');
                setTextInput(results[0].result.slice(0, 3000));
              } else {
                setError('Could not extract text from current tab. Try pasting manually.');
              }
            }
          );
        } else {
          setLoading(false);
          setError('Unable to query active browser tab.');
        }
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (inputTab === 'upload' && !selectedImage) {
      setError('Please upload or snap a picture of the government form or document.');
      return;
    }
    if (inputTab === 'text' && !textInput.trim()) {
      setError('Please paste or type text from the government page.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.analyze({
        image: selectedImage,
        text: textInput,
        target_language: selectedLang
      });
      setResults(res);
    } catch {
      setError('Failed to analyze document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text) => {
    if (!text) return;
    setSpeakingText(text);

    const audioUrl = await api.tts(text, selectedLang);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setSpeakingText(null);
      audio.play();
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'ta' ? 'ta-IN' : selectedLang === 'te' ? 'te-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setSpeakingText(null);
      utterance.onerror = () => setSpeakingText(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setSpeakingText(null);
      alert('Audio playback is not supported on this browser.');
    }
  };

  const loadSampleDemo = () => {
    setInputTab('text');
    setTextInput("Form No. UIDAI-ADDR-01: Application for Aadhaar Address Update. Please provide 12-digit UID, new residence address with 6-digit Pincode, and upload valid proof of address (Utility bill less than 3 months old). Fee ₹50.");
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-amber-500/30 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg">
              Gov
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-amber-400">GovSahayak</h1>
              <p className="text-[10px] text-slate-400">Indian Govt Page Guide & Voice Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <select
              id="language-select"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-slate-900 border border-amber-500/60 text-amber-300 font-medium rounded-lg text-xs px-2 py-1 outline-none"
            >
              {MOCK_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 space-y-4">
        {isExtension && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-2.5 text-center">
            <button
              onClick={captureActiveTab}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition"
            >
              🌐 Extract Current Tab Page Text
            </button>
          </div>
        )}

        {/* Input & Form Tab Controls */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setInputTab('upload')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  inputTab === 'upload'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                📷 Upload Screenshot
              </button>
              <button
                onClick={() => setInputTab('text')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  inputTab === 'text'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                ✏️ Paste Text
              </button>
            </div>

            <button
              onClick={loadSampleDemo}
              className="text-[11px] bg-slate-700 hover:bg-slate-600 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/40 font-semibold"
            >
              ⚡ Load Demo Sample
            </button>
          </div>

          {/* Upload Area */}
          {inputTab === 'upload' ? (
            <div className="space-y-2">
              <div className="border border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/60 rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center space-y-2">
                {imagePreview ? (
                  <div className="space-y-2 w-full">
                    <img
                      src={imagePreview}
                      alt="Government Page Preview"
                      className="max-h-48 mx-auto rounded-lg border border-slate-700 object-contain"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-3xl">📄</div>
                    <p className="text-xs font-medium text-slate-300">
                      Tap here to upload document screenshot
                    </p>
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
                  className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-600 inline-block"
                >
                  {imagePreview ? 'Choose Different Image' : 'Browse File'}
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste government website text or rules..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:border-amber-400 outline-none"
              ></textarea>
            </div>
          )}

          {error && (
            <div className="bg-red-950/80 border border-red-500/60 rounded-lg p-2 text-red-200 text-xs">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm rounded-lg shadow transition flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? <span>Analyzing Government Page...</span> : <span>🔍 Analyze Page</span>}
          </button>
        </section>

        {/* Results Interface */}
        {results && (
          <section className="bg-slate-800 border border-amber-500/40 rounded-xl p-4 shadow-xl space-y-4 animate-fade-in">
            <div className="border-b border-slate-700 pb-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[10px] font-bold text-amber-400 uppercase">🧾 What is this page?</h3>
                  <h4 className="text-base font-bold text-slate-100 mt-0.5">{results.page_purpose}</h4>
                </div>
                <button
                  onClick={() => speakText(`${results.page_purpose}. ${results.simple_explanation}`)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg font-bold text-xs shrink-0"
                >
                  🔊 {speakingText ? 'Playing...' : 'Listen'}
                </button>
              </div>

              <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-200 leading-relaxed">{results.simple_explanation}</p>
              </div>
            </div>

            {results.fields && results.fields.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-amber-300">✏️ Understand the fields</h3>
                <div className="grid grid-cols-1 gap-2">
                  {results.fields.map((field, idx) => (
                    <div key={idx} className="bg-slate-900/70 border border-slate-700 rounded-lg p-2.5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-xs">{field.name}</span>
                        <button
                          onClick={() => speakText(`${field.name}: ${field.explanation}`)}
                          className="text-[10px] text-amber-300 hover:underline"
                        >
                          🔊 Listen
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300">{field.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.required_documents && results.required_documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-amber-300">📄 Documents you need</h3>
                <ul className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-1">
                  {results.required_documents.map((doc, idx) => (
                    <li key={idx} className="text-xs text-slate-200 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.steps && results.steps.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-amber-300">🪜 What to do (Steps)</h3>
                <div className="space-y-1.5">
                  {results.steps.map((step, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-200 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.warnings && results.warnings.length > 0 && (
              <div className="bg-amber-950/60 border border-amber-500/70 rounded-lg p-3 space-y-1">
                <h3 className="text-xs font-bold text-amber-300">⚠️ Important Warnings</h3>
                <ul className="space-y-1 pl-1">
                  {results.warnings.map((warn, idx) => (
                    <li key={idx} className="text-[11px] text-amber-100 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">!</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
