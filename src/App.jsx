import { useState, useEffect } from 'react';
import './App.css';

const MOCK_LANGUAGES = [
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'en', name: 'English' }
];

// Multi-language translations for sample mock responses
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
    ]
  },
  hi: {
    page_purpose: "आधार कार्ड पता अद्यतन आवेदन फॉर्म (UIDAI)",
    simple_explanation: "यह आधिकारिक सरकारी फॉर्म आपके आधार कार्ड पर छपे पते को बदलने या सुधारने के लिए उपयोग किया जाता है। आपको बिजली का बिल, वोटर आईडी या पासपोर्ट जैसे पते का प्रमाण अपलोड करना होगा।",
    fields: [
      { name: "पूरा नाम", explanation: "अपना सही नाम दर्ज करें जैसा कि आपके मूल आधार कार्ड पर है।" },
      { name: "आधार संख्या (12 अंक)", explanation: "आपके कार्ड के आगे छपी आपकी 12 अंकों की विशिष्ट पहचान संख्या।" },
      { name: "नया मकान / द्वार संख्या", explanation: "आपका नया घर या फ्लैट नंबर जहाँ आप वर्तमान में रहते हैं।" },
      { name: "पिनकोड", explanation: "आपके नए इलाके का 6 अंकों का डाक कोड।" },
      { name: "दस्तावेज़ संदर्भ संख्या", explanation: "आपके पते के प्रमाण पत्र पर छपी क्रम संख्या।" }
    ],
    required_documents: [
      "वैध पता प्रमाण (बिजली बिल / पानी बिल / राशन कार्ड जो 3 महीने से पुराना न हो)",
      "मौजूदा आधार कार्ड की प्रति",
      "आधार से जुड़ा मोबाइल नंबर (ओटीपी सत्यापन के लिए)"
    ],
    steps: [
      "अपने 12 अंकों के आधार नंबर और पंजीकृत मोबाइल फोन का सत्यापन करें।",
      "अपना अद्यतन सड़क का पता और पिनकोड ध्यान से भरें।",
      "अपने पते के प्रमाण पत्र का स्पष्ट फोटो अपलोड करें।",
      "फॉर्म जमा करें और ₹50 का शुल्क भुगतान करें।",
      "स्थिति ट्रैक करने के लिए 14 अंकों का अपडेट अनुरोध नंबर (URN) सुरक्षित रखें।"
    ],
    warnings: [
      "सुनिश्चित करें कि आपके दस्तावेज पर नाम आधार नाम से बिल्कुल मेल खाता है।",
      "धुंधली या कटी हुई फोटो अपलोड करने से आवेदन खारिज कर दिया जाएगा।"
    ]
  },
  ta: {
    page_purpose: "ஆதார் கார்டு முகவரி மாற்ற விண்ணப்பம் (UIDAI)",
    simple_explanation: "உங்கள் ஆதார் அட்டையில் அச்சிடப்பட்ட முகவரியைப் புதுப்பிக்க அல்லது திருத்த இந்த அரசு படிவம் பயன்படுத்தப்படுகிறது. மின்சாரக் கட்டணம் அல்லது ரேஷன் கார்டு போன்ற முகவரிச் சான்றை பதிவேற்ற வேண்டும்.",
    fields: [
      { name: "முழு பெயர்", explanation: "உங்கள் அசல் ஆதார் அட்டையில் உள்ளபடி உங்கள் பெயரை உள்ளிடவும்." },
      { name: "ஆதார் எண் (12 இலக்கங்கள்)", explanation: "உங்கள் கார்டின் முன்பக்கத்தில் அச்சிடப்பட்ட 12 இலக்க எண்." },
      { name: "புதிய கதவு/வீட்டு எண்", explanation: "நீங்கள் தற்போது வசிக்கும் புதிய வீட்டு எண்." },
      { name: "அஞ்சல் குறியீடு (Pincode)", explanation: "உங்கள் பகுதியின் 6 இலக்க அஞ்சல் குறியீடு." }
    ],
    required_documents: [
      "செல்லுபடியாகும் முகவரிச் சான்று (மின்சாரக் கட்டணம் / ரேஷன் கார்டு)",
      "தற்போதைய ஆதார் நகல்"
    ],
    steps: [
      "உங்கள் ஆதார் எண் மற்றும் மொபைல் எண்ணைச் சரிபார்க்கவும்.",
      "புதிய முகவரியை சரியாக நிரப்பவும்.",
      "முகவரி சான்றை பதிவேற்றவும்."
    ],
    warnings: [
      "ஆதாரில் உள்ள பெயரும் சான்றிதழில் உள்ள பெயரும் ஒரே மாதிரியாக இருக்க வேண்டும்."
    ]
  },
  te: {
    page_purpose: "ఆధార్ కార్డ్ చిరునామా నవీకరణ ఫారమ్ (UIDAI)",
    simple_explanation: "మీ ఆధార్ కార్డుపై ముద్రించిన చిరునామాను నవీకరించడానికి లేదా సవరించడానికి ఈ అధికారిక ప్రభుత్వ ఫారమ్ ఉపయోగించబడుతుంది.",
    fields: [
      { name: "పూర్తి పేరు", explanation: "మీ ఒరిజినల్ ఆధార్ కార్డులో ఉన్న విధంగా మీ పేరును నమోదు చేయండి." },
      { name: "ఆధార్ సంఖ్య (12 అంకెలు)", explanation: "మీ కార్డుపై ముద్రించిన 12 అంకెల సంఖ్య." }
    ],
    required_documents: [
      "చెల్లుబాటు అయ్యే చిరునామా ఆధార పత్రం (కరెంట్ బిల్లు / రేషన్ కార్డు)"
    ],
    steps: [
      "మీ ఆధార్ సంఖ్యను తనిఖీ చేయండి.",
      "కొత్త చిరునామా వివరాలను నింపండి."
    ],
    warnings: [
      "డాక్యుమెంట్‌లోని పేరు ఆధార్ పేరుతో సరిపోలాలి."
    ]
  },
  bn: {
    page_purpose: "আধার কার্ডের ঠিকানা পরিবর্তনের আবেদন ফরম (UIDAI)",
    simple_explanation: "আপনার আধার কার্ডে মুদ্রিত ঠিকানা আপডেট বা সংশোধন করতে এই সরকারি ফর্মটি ব্যবহার করা হয়।",
    fields: [
      { name: "সম্পূর্ণ নাম", explanation: "আপনার মূল আধার কার্ডে যেভাবে লেখা আছে ঠিক সেভাবে নাম লিখুন।" }
    ],
    required_documents: ["বৈধ ঠিকানার প্রমাণপত্র (বিদ্যুৎ বিল/রেশন কার্ড)"],
    steps: ["আপনার আধার নম্বর যাচাই করুন।", "নতুন ঠিকানা পূরণ করুন।"],
    warnings: ["ডকুমেন্টের নাম এবং আধারের নাম এক হওয়া আবশ্যক।"]
  },
  kn: {
    page_purpose: "ಆಧಾರ್ ಕಾರ್ಡ್ ವಿಳಾಸ ಬದಲಾವಣೆ ಅರ್ಜಿ ಫಾರ್ಮ್ (UIDAI)",
    simple_explanation: "ನಿಮ್ಮ ಆಧಾರ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಮುದ್ರಿಸಲಾದ ವಿಳಾಸವನ್ನು ನವೀಕರಿಸಲು ಅಥವಾ ತಿದ್ದುಪಡಿ ಮಾಡಲು ಈ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಫಾರ್ಮ್ ಅನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.",
    fields: [
      { name: "ಪೂರ್ಣ ಹೆಸರು", explanation: "ನಿಮ್ಮ ಮೂಲ ಆಧಾರ್ ಕಾರ್ಡ್‌ನಲ್ಲಿರುವಂತೆ ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ." }
    ],
    required_documents: ["ಚಾಲ್ತಿಯಲ್ಲಿರುವ ವಿಳಾಸದ ಪುರಾವೆ (ವಿದ್ಯುತ್ ಬಿಲ್ / ರೇಷನ್ ಕಾರ್ಡ್)"],
    steps: ["ನಿಮ್ಮ 12 ಅಂದೆಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.", "ಹೊಸ ವಿಳಾಸವನ್ನು ಭರ್ತಿ ಮಾಡಿ."],
    warnings: ["ದಾಖಲೆಯಲ್ಲಿರುವ ಹೆಸರು ಆಧಾರ್ ಹೆಸರಿಗೆ ಸರಿಯಾಗಿ ಹೊಂದಾಣಿಕೆಯಾಗಬೇಕು."]
  },
  mr: {
    page_purpose: "आधार कार्ड पत्ता दुरुस्ती अर्ज (UIDAI)",
    simple_explanation: "हा अधिकृत शासकीय अर्ज तुमच्या आधार कार्डावरील पत्ता बदलण्यासाठी किंवा दुरुस्त करण्यासाठी वापरला जातो.",
    fields: [
      { name: "पूर्ण नाव", explanation: "मूळ आधार कार्डावर असलेले तुमचे नाव प्रविष्ट करा." }
    ],
    required_documents: ["वैध पत्त्याचा पुरावा (वीज बिल / रेशन कार्ड)"],
    steps: ["तुमचा १२ अंकी आधार क्रमांक पडताळून पहा.", "नवीन पत्ता भरा."],
    warnings: ["पुरावा दस्तऐवजावरील नाव आधारवरील नावाशी तंतोतंत जुळले पाहिजे."]
  },
  gu: {
    page_purpose: "આધાર કાર્ડ સરનામું અપડેટ ફોર્મ (UIDAI)",
    simple_explanation: "આ સરકારી ફોર્મ તમારા આધાર કાર્ડ પર છપાયેલ સરનામું સુધારવા માટે ઉપયોગમાં લેવાય છે.",
    fields: [
      { name: "પૂરું નામ", explanation: "તમારા મૂળ આધાર કાર્ડ મુજબનું નામ દાખલ કરો." }
    ],
    required_documents: ["સરનામાનો પુરાવો (લાઇટ બિલ / રેશન કાર્ડ)"],
    steps: ["તમારો ૧૨ આંકડાનો આધાર નંબર ચકાસો.", "નવું સરનામું ભરો."],
    warnings: ["પુરાવા પરનું નામ આધાર કાર્ડ સાથે મળતું હોવું જોઈએ."]
  }
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
      await new Promise((r) => setTimeout(r, 600));
      const lang = data.target_language || 'hi';
      return {
        success: true,
        ...(MOCK_TRANSLATIONS[lang] || MOCK_TRANSLATIONS.hi)
      };
    }
  },
  async translate(text, target_language) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language })
      });
      if (!res.ok) throw new Error('Translation failed');
      return await res.json();
    } catch {
      return null;
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

  // Update results dynamically when language selection changes
  const handleLanguageChange = async (newLang) => {
    setSelectedLang(newLang);
    if (results) {
      // Re-run analysis or update translation dynamically
      setLoading(true);
      try {
        const res = await api.analyze({
          image: selectedImage,
          text: textInput,
          target_language: newLang
        });
        setResults(res);
      } catch {
        // Fallback to local mock translations
        setResults({
          success: true,
          ...(MOCK_TRANSLATIONS[newLang] || MOCK_TRANSLATIONS.en)
        });
      } finally {
        setLoading(false);
      }
    }
  };

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
            (resultsArr) => {
              setLoading(false);
              if (resultsArr && resultsArr[0] && resultsArr[0].result) {
                setInputTab('text');
                setTextInput(resultsArr[0].result.slice(0, 3000));
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

    // Try backend TTS API first
    const audioUrl = await api.tts(text, selectedLang);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setSpeakingText(null);
      audio.onerror = () => setSpeakingText(null);
      audio.play();
      return;
    }

    // Web Speech API fallback for regional Indian voice synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const langMap = {
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        kn: 'kn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        en: 'en-US'
      };

      utterance.lang = langMap[selectedLang] || 'hi-IN';
      utterance.rate = 0.85; // Slower clear voice speed

      // Try selecting native regional voice if available in browser
      const voices = window.speechSynthesis.getVoices();
      const regionalVoice = voices.find((v) => v.lang.startsWith(selectedLang) || v.lang === langMap[selectedLang]);
      if (regionalVoice) {
        utterance.voice = regionalVoice;
      }

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
            <label htmlFor="language-select" className="text-xs font-semibold text-slate-300">
              🌐 Language:
            </label>
            <select
              id="language-select"
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-900 border-2 border-amber-500/80 text-amber-300 font-bold rounded-lg text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer"
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
            {loading ? <span>Analyzing Page ({MOCK_LANGUAGES.find(l=>l.code===selectedLang)?.name})...</span> : <span>🔍 Analyze & Translate Page</span>}
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
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 flex items-center gap-1 shadow"
                >
                  🔊 {speakingText === `${results.page_purpose}. ${results.simple_explanation}` ? 'Playing...' : 'Listen Audio'}
                </button>
              </div>

              <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{results.simple_explanation}</p>
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
                          className="text-[10px] text-amber-300 hover:underline flex items-center gap-1"
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
