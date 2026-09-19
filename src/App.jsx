import { useState, useEffect, useRef } from 'react';
import './App.css';

// Centralized Language Configuration Mapping
const LANGUAGE_CONFIG = {
  hi: { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳', translationCode: 'hi', ttsCode: 'hi-IN', locale: 'hi-IN' },
  kn: { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', translationCode: 'kn', ttsCode: 'kn-IN', locale: 'kn-IN' },
  ta: { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳', translationCode: 'ta', ttsCode: 'ta-IN', locale: 'ta-IN' },
  te: { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳', translationCode: 'te', ttsCode: 'te-IN', locale: 'te-IN' },
  bn: { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳', translationCode: 'bn', ttsCode: 'bn-IN', locale: 'bn-IN' },
  mr: { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳', translationCode: 'mr', ttsCode: 'mr-IN', locale: 'mr-IN' },
  gu: { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', translationCode: 'gu', ttsCode: 'gu-IN', locale: 'gu-IN' },
  en: { code: 'en', name: 'English', flag: '🌐', translationCode: 'en', ttsCode: 'en-US', locale: 'en-US' }
};

const MOCK_LANGUAGES = Object.values(LANGUAGE_CONFIG);

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
    ],
    ocrText: "Form No. UIDAI-ADDR-01\nAPPLICATION FOR AADHAAR CARD ADDRESS UPDATE\n1. UID Number: [12 Digits]\n2. Resident Name:\n3. New Residential Address: House No / Street / Landmark / Pincode\n4. Supporting Document: Electricity Bill / Voter ID / Passport\n5. Fee: Rs. 50 (Non-refundable)"
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
    ],
    ocrText: "ಫಾರ್ಮ್ ನಂ. UIDAI-ADDR-01\nಆಧಾರ್ ವಿಳಾಸ ಬದಲಾವಣೆ ಅರ್ಜಿ\n೧. ಆಧಾರ್ ಸಂಖ್ಯೆ: [೧೨ ಅಂಕೆಗಳು]\n೨. ಅರ್ಜಿದಾರರ ಹೆಸರು:\n೩. ಹೊಸ ವಿಳಾಸ:\n೪. ವಿಳಾಸದ ದಾಖಲೆ: ವಿದ್ಯುತ್ ಬಿಲ್ / ರೇಷನ್ ಕಾರ್ಡ್\n೫. ಶುಲ್ಕ: ₹೫೦"
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
    ],
    ocrText: "फॉर्म संख्या UIDAI-ADDR-01\nआधार कार्ड पता अद्यतन आवेदन पत्र\n1. आधार नंबर: [12 अंक]\n2. नाम:\n3. नया पता:\n4. पता प्रमाण: बिजली बिल / राशन कार्ड\n5. शुल्क: रु 50"
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
    ],
    ocrText: "படிவம் எண். UIDAI-ADDR-01\nஆதார் முகவரி மாற்ற விண்ணப்பம்\n1. ஆதார் எண்: [12 இலக்கங்கள்]"
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
    ],
    ocrText: "ఫారమ్ నం. UIDAI-ADDR-01\nఆధార్ చిరునామా మార్పు దరఖాస్తు"
  },
  bn: {
    page_purpose: "আধার কার্ডের ঠিকানা পরিবর্তনের আবেদন ফরম (UIDAI)",
    simple_explanation: "আপনার আধার কার্ডে মুদ্রিত ঠিকানা আপডেট বা সংশোধন করতে এই সরকারি ফর্মটি ব্যবহার করা হয়।",
    fields: [
      { name: "সম্পূর্ণ নাম", explanation: "আপনার মূল আধার কার্ডে যেভাবে লেখা আছে ঠিক সেভাবে নাম লিখুন।" }
    ],
    required_documents: ["বৈধ ঠিকানার প্রমাণপত্র (বিদ্যুৎ বিল/রেশন কার্ড)"],
    steps: ["আপনার আধার নম্বর যাচাই করুন।", "নতুন ঠিকানা পূরণ করুন।"],
    warnings: ["ডকুমেন্টের নাম এবং আধারের নাম এক হওয়া আবশ্যক।"],
    ocrText: "ফর্ম নং UIDAI-ADDR-01\nআধার ঠিকানা পরিবর্তনের আবেদনপত্র"
  },
  mr: {
    page_purpose: "आधार कार्ड पत्ता दुरुस्ती अर्ज (UIDAI)",
    simple_explanation: "हा अधिकृत शासकीय अर्ज तुमच्या आधार कार्डावरील पत्ता बदलण्यासाठी किंवा दुरुस्त करण्यासाठी वापरला जातो.",
    fields: [
      { name: "पूर्ण नाव", explanation: "मूळ आधार कार्डावर असलेले तुमचे नाव प्रविष्ट करा." }
    ],
    required_documents: ["वैध पत्त्याचा पुरावा (वीज बिल / रेशन कार्ड)"],
    steps: ["तुमचा १२ अंकी आधार क्रमांक पडताळून पहा.", "नवीन पत्ता भरा."],
    warnings: ["पुरावा दस्तऐवजावरील नाव आधारवरील नावाशी तंतोतंत जुळले पाहिजे."],
    ocrText: "फॉर्म क्र. UIDAI-ADDR-01\nआधार कार्ड पत्ता बदल अर्ज"
  },
  gu: {
    page_purpose: "આધાર કાર્ડ સરનામું અપડેટ ફોર્મ (UIDAI)",
    simple_explanation: "આ સરકારી ફોર્મ તમારા આધાર કાર્ડ પર છપાયેલ સરનામું સુધારવા માટે ઉપયોગમાં લેવાય છે.",
    fields: [
      { name: "પૂરું નામ", explanation: "તમારા મૂળ આધાર કાર્ડ મુજબનું નામ દાખલ કરો." }
    ],
    required_documents: ["સરનામાનો પુરાવો (લાઇટ બિલ / રેશન કાર્ડ)"],
    steps: ["તમારો ૧૨ આંકડાનો આધાર નંબર ચકાસો.", "નવું સરનામું ભરો."],
    warnings: ["પુરાવા પરનું નામ આધાર કાર્ડ સાથે મળતું હોવું જોઈએ."],
    ocrText: "ફોર્મ નં. UIDAI-ADDR-01\nઆધાર કાર્ડ સરનામું ફેરફાર અરજી"
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
      if (!res.ok) throw new Error(`Analysis failed with status ${res.status}`);
      const json = await res.json();
      return json;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      const lang = data.target_language || 'hi';
      const mockData = MOCK_TRANSLATIONS[lang] || MOCK_TRANSLATIONS.en;
      return {
        success: true,
        ocrText: data.text || mockData.ocrText || "OCR extracted text sample",
        ...mockData
      };
    }
  },
  async tts(text, languageCode) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: languageCode })
      });
      if (!res.ok) throw new Error(`TTS request failed with status ${res.status}`);
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

  // Interactive Checklist & Field States
  const [checkedDocs, setCheckedDocs] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});
  const [fieldFilter, setFieldFilter] = useState('');

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudioKey(null);
    setIsAudioLoading(false);
    setAudioLabel('');
    setIsPlayingAudio(false);
  };

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
      } catch {
        const fallback = MOCK_TRANSLATIONS[newLang] || MOCK_TRANSLATIONS.en;
        setTranslatedResult({
          success: true,
          ...fallback
        });
        if (fallback.ocrText) setOcrText(fallback.ocrText);
      } finally {
        setLoading(false);
      }
    }
  };

  const speakText = async (textToSpeak, key, label) => {
    if (!textToSpeak || !textToSpeak.trim()) return;

    if (activeAudioKey === key && (isPlayingAudio || isAudioLoading)) {
      stopAudio();
      return;
    }

    stopAudio();
    setAudioError(null);
    setActiveAudioKey(key);
    setIsAudioLoading(true);
    setAudioLabel(label || textToSpeak.slice(0, 40) + '...');

    const langConfig = LANGUAGE_CONFIG[selectedLang] || LANGUAGE_CONFIG.hi;
    const cleanText = textToSpeak.replace(/\s+/g, ' ').trim();

    // 1. Try Backend Audio API first
    const audioUrl = await api.tts(cleanText, langConfig.ttsCode || langConfig.code);
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.playbackRate = speechRate;
        audio.oncanplaythrough = () => {
          setIsAudioLoading(false);
          setIsPlayingAudio(true);
        };
        audio.onended = () => {
          stopAudio();
        };
        audio.onerror = () => {
          stopAudio();
          setAudioError('Failed to play server audio. Falling back to device voice.');
          fallbackBrowserSpeech(cleanText, langConfig);
        };
        await audio.play();
        setIsAudioLoading(false);
        setIsPlayingAudio(true);
        return;
      } catch {
        // Continue to browser fallback below
      }
    }

    // 2. Fallback to Browser Web Speech API
    fallbackBrowserSpeech(cleanText, langConfig);
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
        setAudioError('Voice synthesis error occurred for this language.');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      stopAudio();
      setAudioError('Audio playback is not supported on this browser.');
    }
  };

  const speakFullOverview = () => {
    if (!translatedResult) return;
    const overviewSpeechText = `
      ${translatedResult.page_purpose || ''}.
      ${translatedResult.simple_explanation || ''}.
      ${translatedResult.steps ? 'Steps to follow: ' + translatedResult.steps.join('. ') : ''}.
    `;
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
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md shadow-sm transition-colors ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-amber-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-extrabold text-white text-lg shadow-md tracking-tight shrink-0">
              Gov
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                  GovSahayak
                </h1>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Govt Form Voice Assistant
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Simplified Multi-Lingual Representation & Audio Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5">
              <label htmlFor="language-select" className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                🌐 Language:
              </label>
              <select
                id="language-select"
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`font-bold rounded-xl text-xs sm:text-sm px-3 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer transition border ${
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
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border transition flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-200'
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
          isDarkMode ? 'bg-amber-950/90 border-amber-700 text-amber-100' : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-4 text-amber-600 dark:text-amber-400">
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
                <span className="sound-wave-bar"></span>
              </div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {isAudioLoading ? '⏳ Generating Audio...' : '🔊 Playing Voice Guide:'}
              </span>
              <span className="text-xs font-medium truncate max-w-[200px] sm:max-w-md italic">
                "{audioLabel}" ({LANGUAGE_CONFIG[selectedLang]?.name})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed controls */}
              <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
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
                        ? 'bg-amber-500 text-white shadow'
                        : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📷 Upload Image
                  </button>
                  <button
                    onClick={() => setInputTab('text')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                      inputTab === 'text'
                        ? 'bg-amber-500 text-white shadow'
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
                      ? 'bg-slate-800 border-amber-500/40 text-amber-300 hover:bg-slate-700'
                      : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
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
                      ? 'border-amber-500/30 hover:border-amber-400 bg-slate-950/40'
                      : 'border-amber-300 hover:border-amber-500 bg-amber-50/40'
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
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
                          📄
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
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
                      className="cursor-pointer bg-slate-800 hover:bg-slate-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition inline-block"
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
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
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
                    ? 'ring-2 ring-amber-500 bg-amber-50/90 dark:bg-amber-950/50'
                    : isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-50/60 border-amber-200/80'
                }`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500 text-white uppercase tracking-wider">
                          Official Purpose ({LANGUAGE_CONFIG[selectedLang]?.name})
                        </span>
                        {activeAudioKey === 'full_overview' && (
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse flex items-center gap-1">
                            🔊 Speaking now...
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg sm:text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
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
                            : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
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
                        <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full">
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
                                ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-300'
                                : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                                {field.name}
                              </span>
                              <button
                                onClick={() => speakText(`${field.name}: ${field.explanation}`, fieldKey, `Field: ${field.name}`)}
                                className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold border transition ${
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
                {translatedResult.warnings && translatedResult.warnings.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-2">
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
                isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-500'
              }`}>
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-3xl">
                  🎧
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Ready for Govt Form Multi-lingual Analysis
                </h3>
                <p className="text-xs max-w-md mx-auto">
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
