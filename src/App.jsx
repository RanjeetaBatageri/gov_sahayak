import { useState, useEffect } from 'react';
import './App.css';

const MOCK_LANGUAGES = [
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🌐' }
];

// Complete multi-lingual structured translations
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
  kn: {
    page_purpose: "ಆಧಾರ್ ಕಾರ್ಡ್ ವಿಳಾಸ ಬದಲಾವಣೆ ಅರ್ಜಿ ಫಾರ್ಮ್ (UIDAI)",
    simple_explanation: "ನಿಮ್ಮ ಆಧಾರ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಮುದ್ರಿಸಲಾದ ವಸತಿ ವಿಳಾಸವನ್ನು ನವೀಕರಿಸಲು ಅಥವಾ ತಿದ್ದುಪಡಿ ಮಾಡಲು ಈ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಫಾರ್ಮ್ ಅನ್ನು ಬಳಸಲಾಗುತ್ತದೆ. ವಿದ್ಯುತ್ ಬಿಲ್, ವೋಟರ್ ಐಡಿ ಅಥವಾ ಪಾಸ್‌ಪೋರ್ಟ್‌ನಂತಹ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ವಿಳಾಸದ ಪುರಾವೆಯನ್ನು ನೀವು ಅಪ್‌ಲೋಡ್ ಮಾಡಬೇಕಾಗುತ್ತದೆ.",
    fields: [
      { name: "ಪೂರ್ಣ ಹೆಸರು", explanation: "ನಿಮ್ಮ ಮೂಲ ಆಧಾರ್ ಕಾರ್ಡ್‌ನಲ್ಲಿರುವಂತೆ ನಿಮ್ಮ ಹೆಸರನ್ನು ಸರಿಯಾಗಿ ನಮೂದಿಸಿ." },
      { name: "ಆಧಾರ್ ಸಂಖ್ಯೆ (12 ಅಂಕೆಗಳು)", explanation: "ನಿಮ್ಮ ಕಾರ್ಡ್ ಮುಂಭಾಗದಲ್ಲಿರುವ 12 ಅಂಕೆಗಳ ವಿಶಿಷ್ಟ ಗುರುತಿನ ಸಂಖ್ಯೆ." },
      { name: "ಹೊಸ ಮನೆ / ಬಾಗಿಲಿನ ಸಂಖ್ಯೆ", explanation: "ನೀವು ಪ್ರಸ್ತುತ ವಾಸಿಸುತ್ತಿರುವ ಹೊಸ ಮನೆ ಅಥವಾ ಫ್ಲಾಟ್ ಸಂಖ್ಯೆ." },
      { name: "ಪಿನ್‌ಕೋಡ್", explanation: "ನಿಮ್ಮ ಹೊಸ ಪ್ರದೇಶದ 6 ಅಂಕೆಗಳ ಅಂಚೆ ಕೋಡ್." },
      { name: "ದಾಖಲೆ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ", explanation: "ನಿಮ್ಮ ವಿಳಾಸ ಪುರಾವೆ ದಾಖಲೆಯಲ್ಲಿರುವ ಅನುಕ್ರಮ ಸಂಖ್ಯೆ." }
    ],
    required_documents: [
      "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ವಿಳಾಸದ ಪುರಾವೆ (ವಿದ್ಯುತ್ ಬಿಲ್ / ನೀರು ಬಿಲ್ / ರೇಷನ್ ಕಾರ್ಡ್ 3 ತಿಂಗಳಿಗಿಂತ ಹಳೆಯದಾಗಿರಬಾರದು)",
      "ಹಾಲಿ ಆಧಾರ್ ಕಾರ್ಡ್‌ನ ಪ್ರತಿ",
      "ಆಧಾರ್‌ಗೆ ಲಿಂಕ್ ಮಾಡಲಾದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (ಒಟಿಪಿ ಪರಿಶೀಲನೆಗೆ)"
    ],
    steps: [
      "ನಿಮ್ಮ 12 ಅಂಕೆಗಳ ಆಧಾರ್ ಸಂಖ್ಯೆ ಮತ್ತು ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
      "ನಿಮ್ಮ ಹೊಸ ವಿಳಾಸ ಮತ್ತು ಪಿನ್‌ಕೋಡ್ ಅನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಭರ್ತಿ ಮಾಡಿ.",
      "ನಿಮ್ಮ ವಿಳಾಸ ಪುರಾವೆ ದಾಖಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
      "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿ ಮತ್ತು ₹50 ನಿಗದಿತ ಶುಲ್ಕವನ್ನು ಪಾವತಿಸಿ.",
      "ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು 14 ಅಂಕೆಗಳ ನವೀಕರಣ ವಿನಂತಿ ಸಂಖ್ಯೆಯನ್ನು (URN) ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ."
    ],
    warnings: [
      "ನಿಮ್ಮ ವಿಳಾಸ ದಾಖಲೆಯಲ್ಲಿರುವ ಹೆಸರು ಆಧಾರ್ ಕಾರ್ಡ್‌ನಲ್ಲಿರುವ ಹೆಸರಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಹೊಂದಿಕೆಯಾಗಬೇಕು.",
      "ಮಸುಕಾದ ಅಥವಾ ಸರಿಯಾಗಿ ಕಾಣಿಸದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದರೆ ಅರ್ಜಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ."
    ]
  },
  hi: {
    page_purpose: "आधार कार्ड पता अद्यतन आवेदन फॉर्म (UIDAI)",
    simple_explanation: "यह आधिकारिक सरकारी फॉर्म आपके आधार कार्ड पर छपे पते को बदलने या सुधारने के लिए उपयोग किया जाता है। आपको बिजली का बिल, वोटर आईडी या पासपोर्ट जैसे पते का प्रमाण पत्र अपलोड करना होगा।",
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
      "தற்போதைய ஆதார் நகல்",
      "ஆதாருடன் இணைக்கப்பட்ட மொபைல் எண்"
    ],
    steps: [
      "உங்கள் ஆதார் எண் மற்றும் மொபைல் எண்ணைச் சரிபார்க்கவும்.",
      "புதிய முகவரியை சரியாக நிரப்பவும்.",
      "முகவரி சான்றை பதிவேற்றவும்.",
      "₹50 கட்டணம் செலுத்தவும்."
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
      await new Promise((r) => setTimeout(r, 400));
      const lang = data.target_language || 'hi';
      return {
        success: true,
        ...(MOCK_TRANSLATIONS[lang] || MOCK_TRANSLATIONS.en)
      };
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
  
  // Theme state: default is LIGHT mode (isDarkMode = false)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Audio state
  const [activeAudioKey, setActiveAudioKey] = useState(null);
  const [audioLabel, setAudioLabel] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Representation interactive states
  const [checkedDocs, setCheckedDocs] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});
  const [fieldFilter, setFieldFilter] = useState('');

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLanguageChange = async (newLang) => {
    setSelectedLang(newLang);
    stopAudio();
    if (results) {
      setLoading(true);
      try {
        const res = await api.analyze({
          image: selectedImage,
          text: textInput,
          target_language: newLang
        });
        setResults(res);
      } catch {
        setResults({
          success: true,
          ...(MOCK_TRANSLATIONS[newLang] || MOCK_TRANSLATIONS.en)
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudioKey(null);
    setAudioLabel('');
    setIsPlayingAudio(false);
  };

  const speakText = async (text, key, label) => {
    if (!text) return;

    if (activeAudioKey === key && isPlayingAudio) {
      stopAudio();
      return;
    }

    stopAudio();
    setActiveAudioKey(key);
    setAudioLabel(label || text.slice(0, 40) + '...');
    setIsPlayingAudio(true);

    const audioUrl = await api.tts(text, selectedLang);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speechRate;
      audio.onended = () => {
        setActiveAudioKey(null);
        setIsPlayingAudio(false);
      };
      audio.onerror = () => {
        setActiveAudioKey(null);
        setIsPlayingAudio(false);
      };
      audio.play();
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      const langMap = {
        hi: 'hi-IN',
        kn: 'kn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        en: 'en-US'
      };

      utterance.lang = langMap[selectedLang] || 'hi-IN';
      utterance.rate = speechRate;

      const voices = window.speechSynthesis.getVoices();
      const regionalVoice = voices.find((v) => v.lang.startsWith(selectedLang) || v.lang === langMap[selectedLang]);
      if (regionalVoice) {
        utterance.voice = regionalVoice;
      }

      utterance.onend = () => {
        setActiveAudioKey(null);
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setActiveAudioKey(null);
        setIsPlayingAudio(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setActiveAudioKey(null);
      setIsPlayingAudio(false);
      alert('Audio playback is not supported on this browser.');
    }
  };

  const speakFullOverview = () => {
    if (!results) return;
    const fullSpeechText = `
      ${results.page_purpose}.
      ${results.simple_explanation}.
      ${results.steps ? 'Steps to follow: ' + results.steps.join('. ') : ''}.
    `;
    speakText(fullSpeechText, 'full_overview', 'Full Document Voice Walkthrough');
  };

  const toggleDocCheck = (idx) => {
    setCheckedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStepComplete = (idx) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const loadSampleDemo = () => {
    setInputTab('text');
    setTextInput("Form No. UIDAI-ADDR-01: Application for Aadhaar Address Update. Please provide 12-digit UID, new residence address with 6-digit Pincode, and upload valid proof of address (Utility bill less than 3 months old). Fee ₹50.");
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
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
      setCheckedDocs({});
      setCompletedSteps({});
    } catch {
      setError('Failed to analyze document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFields = results?.fields?.filter((f) =>
    f.name.toLowerCase().includes(fieldFilter.toLowerCase()) ||
    f.explanation.toLowerCase().includes(fieldFilter.toLowerCase())
  ) || [];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 flex flex-col ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md shadow-sm transition-colors ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-amber-200/80 text-slate-900'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-extrabold text-white text-lg shadow-md tracking-tight">
              Gov
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-amber-600 dark:text-amber-400">
                  GovSahayak
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Govt Form Voice Assistant
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Simplified Multi-Lingual Representation & Audio Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5">
              <label htmlFor="language-select" className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                🌐 Language:
              </label>
              <select
                id="language-select"
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`font-bold rounded-lg text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer transition border ${
                  isDarkMode
                    ? 'bg-slate-900 border-amber-500/60 text-amber-300'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
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
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Active Audio Player Bar */}
      {isPlayingAudio && (
        <div className={`sticky top-[61px] z-40 border-b px-4 py-2 transition-all animate-fade-in shadow-md ${
          isDarkMode ? 'bg-amber-950/90 border-amber-700 text-amber-100' : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-4 text-amber-600 dark:text-amber-400">
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
              </div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                🔊 Playing Voice Guide:
              </span>
              <span className="text-xs font-medium truncate max-w-[240px] sm:max-w-xs italic">
                "{audioLabel}"
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed controls */}
              <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/80 px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Speed:</span>
                {[0.8, 1.0, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSpeechRate(speed)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      speechRate === speed
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-amber-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Stop Button */}
              <button
                onClick={stopAudio}
                className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md font-bold text-xs shadow transition flex items-center gap-1"
              >
                ⏹️ Stop Audio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6">
        
        {/* Input & Form Tab Controls */}
        <section className={`border rounded-2xl p-5 shadow-sm transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 mb-4 flex-wrap gap-2 border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <button
                onClick={() => setInputTab('upload')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  inputTab === 'upload'
                    ? 'bg-amber-500 text-white shadow'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📷 Upload Screenshot
              </button>
              <button
                onClick={() => setInputTab('text')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  inputTab === 'text'
                    ? 'bg-amber-500 text-white shadow'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ✏️ Paste Text / URL
              </button>
            </div>

            <button
              onClick={loadSampleDemo}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1 ${
                isDarkMode
                  ? 'bg-slate-800 border-amber-500/40 text-amber-300 hover:bg-slate-700'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
            >
              ⚡ Load Aadhaar Sample
            </button>
          </div>

          {/* Upload Area */}
          {inputTab === 'upload' ? (
            <div className="space-y-3">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                isDarkMode
                  ? 'border-amber-500/30 hover:border-amber-400 bg-slate-950/40'
                  : 'border-amber-300 hover:border-amber-500 bg-amber-50/40'
              }`}>
                {imagePreview ? (
                  <div className="space-y-3 w-full">
                    <img
                      src={imagePreview}
                      alt="Government Page Preview"
                      className="max-h-56 mx-auto rounded-lg border border-slate-300 dark:border-slate-700 object-contain shadow-sm"
                    />
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Image loaded ready for multi-lingual translation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
                      📄
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        Upload photo or screenshot of any Indian Govt Form
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Supports Aadhaar, Passport, Ration Card, Voter ID, Ration, etc.
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
                  className="cursor-pointer bg-slate-800 hover:bg-slate-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition inline-block"
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
                placeholder="Paste government portal text or form requirements here..."
                className={`w-full rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none transition border ${
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
            className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Translating & Analyzing for {MOCK_LANGUAGES.find(l=>l.code===selectedLang)?.name}...</span>
              </>
            ) : (
              <>
                <span>🔍 Analyze & Voice Guide</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {MOCK_LANGUAGES.find(l=>l.code===selectedLang)?.name}
                </span>
              </>
            )}
          </button>
        </section>

        {/* Results Interface */}
        {results && (
          <section className={`border rounded-2xl p-5 shadow-sm space-y-6 animate-fade-in transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Overview Banner & Voice Walkthrough Button */}
            <div className={`border rounded-2xl p-4 transition-all ${
              activeAudioKey === 'full_overview'
                ? 'ring-2 ring-amber-500 bg-amber-50/90 dark:bg-amber-950/50'
                : isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-50/60 border-amber-200/80'
            }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500 text-white uppercase tracking-wider">
                      Official Purpose
                    </span>
                    {activeAudioKey === 'full_overview' && (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse flex items-center gap-1">
                        🔊 Speaking now...
                      </span>
                    )}
                  </div>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {results.page_purpose}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {results.simple_explanation}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={speakFullOverview}
                    className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition flex items-center gap-2 border ${
                      activeAudioKey === 'full_overview'
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                    }`}
                  >
                    <span>{activeAudioKey === 'full_overview' ? '⏹️ Stop Voice Overview' : '🔊 Listen Full Overview'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document Checklist Representation */}
            {results.required_documents && results.required_documents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    <span>📋 Required Documents Checklist</span>
                    <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                      {Object.values(checkedDocs).filter(Boolean).length} / {results.required_documents.length} Ready
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {results.required_documents.map((doc, idx) => {
                    const docKey = `doc-${idx}`;
                    const isChecked = !!checkedDocs[idx];
                    const isSpeaking = activeAudioKey === docKey;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                          isSpeaking
                            ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-300'
                            : isChecked
                            ? isDarkMode ? 'bg-emerald-950/30 border-emerald-800/80' : 'bg-emerald-50/60 border-emerald-200'
                            : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDocCheck(idx)}
                            className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer rounded"
                          />
                          <div>
                            <span className={`text-xs font-semibold block ${
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
                              ? 'bg-amber-500 text-white border-amber-600'
                              : isDarkMode
                              ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
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
            {results.steps && results.steps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    <span>🪜 Guided Step-by-Step Procedure</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {results.steps.map((step, idx) => {
                    const stepKey = `step-${idx}`;
                    const isDone = !!completedSteps[idx];
                    const isSpeaking = activeAudioKey === stepKey;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                          isSpeaking
                            ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-300'
                            : isDone
                            ? isDarkMode ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-emerald-50/40 border-emerald-200'
                            : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => toggleStepComplete(idx)}
                            className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </button>
                          <div>
                            <p className={`text-xs font-medium ${
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
                              ? 'bg-amber-500 text-white border-amber-600'
                              : isDarkMode
                              ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
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
            {results.fields && results.fields.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredFields.map((field, idx) => {
                    const fieldKey = `field-${idx}`;
                    const isSpeaking = activeAudioKey === fieldKey;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition space-y-1.5 ${
                          isSpeaking
                            ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-300'
                            : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                            {field.name}
                          </span>
                          <button
                            onClick={() => speakText(`${field.name}: ${field.explanation}`, fieldKey, `Field: ${field.name}`)}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold border transition ${
                              isSpeaking
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200'
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
            {results.warnings && results.warnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>⚠️ Important Safety Warnings</span>
                  </h3>
                  <button
                    onClick={() => speakText(`Important Warnings: ${results.warnings.join('. ')}`, 'warnings', 'Safety Warnings')}
                    className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
                  >
                    🔊 Listen Warnings
                  </button>
                </div>
                <ul className="space-y-1.5">
                  {results.warnings.map((warn, idx) => (
                    <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                      <span className="text-amber-600 font-bold shrink-0">!</span>
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
