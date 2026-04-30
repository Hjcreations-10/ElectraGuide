import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, 
  MapPin, 
  Calendar, 
  BarChart3, 
  ShieldAlert, 
  ChevronRight, 
  Languages, 
  Play,
  RotateCcw,
  CheckCircle2,
  Info,
  Volume2,
  User,
  Users,
  Activity,
  Zap,
  Mic,
  MicOff,
  ChevronDown
} from 'lucide-react';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Sector,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  LabelList
} from 'recharts';

import { AppTab, VoterProfile, VoterStep, DashboardRegion } from './types';
import { HISTORICAL_TURNOUT, STATE_COMPARISON, LANGUAGES, FAKE_NEWS_TIPS, ELECTION_RESULTS_2019, DOCUMENT_IMAGES, CONSTITUENCY_RESULTS, DASHBOARD_REGIONS } from './constants';
import { translateText, translateBatch, getElectionInsights } from './services/geminiService';

// --- Components ---

const Avatar = ({ speaking, listening }: { speaking: boolean, listening: boolean }) => (
  <div className="relative w-32 h-32 mx-auto mb-6">
    <motion.div 
      animate={{ 
        scale: speaking ? [1, 1.05, 1] : listening ? [1, 1.1, 1] : 1,
        rotate: speaking ? [-1, 1, -1] : 0
      }}
      transition={{ repeat: Infinity, duration: speaking ? 0.5 : 1 }}
      className={`w-full h-full rounded-full flex items-center justify-center border-4 shadow-xl overflow-hidden transition-colors ${
        listening ? 'bg-blue-100 border-blue-500' : 'bg-orange-100 border-orange-500'
      }`}
    >
      <User className={`w-20 h-20 mt-4 ${listening ? 'text-blue-600' : 'text-orange-600'}`} />
    </motion.div>
    {speaking && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -top-2 -right-2 bg-orange-600 text-white p-2 rounded-full shadow-lg"
      >
        <Volume2 className="w-4 h-4 animate-pulse" />
      </motion.div>
    )}
    {listening && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -top-2 -left-2 bg-blue-600 text-white p-2 rounded-full shadow-lg"
      >
        <Mic className="w-4 h-4 animate-bounce" />
      </motion.div>
    )}
  </div>
);

const LanguageSelector = ({ current, onSelect }: { current: string, onSelect: (lang: string) => void }) => (
  <div className="relative flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg group hover:bg-white/20 transition-all">
    <Languages className="w-4 h-4 text-orange-200 mr-2" />
    <select 
      value={current} 
      onChange={(e) => onSelect(e.target.value)}
      className="bg-transparent text-sm font-bold outline-none text-white appearance-none pr-6 cursor-pointer"
    >
      {LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code} className="text-gray-900 bg-white font-medium">
          {lang.name}
        </option>
      ))}
    </select>
    <div className="absolute right-4 pointer-events-none text-white/50 group-hover:text-white transition-colors">
      <ChevronDown className="w-3 h-3" />
    </div>
  </div>
);

const SectionHeading = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <div className="flex items-center gap-3 mb-6">
    {Icon && <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Icon className="w-5 h-5" /></div>}
    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{children}</h2>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('assistant');
  const [language, setLanguage] = useState('en');
  const [profile, setProfile] = useState<VoterProfile>({ hasId: false, language: 'en' });
  const [insight, setInsight] = useState<string>('');
  const [translatedUI, setTranslatedUI] = useState<any>({});
  const [translationCache, setTranslationCache] = useState<Record<string, Record<string, string>>>({});
  
  // Assistant States
  const [assistantStep, setAssistantStep] = useState(0);
  const [assistantScene, setAssistantScene] = useState<'intro' | 'registration' | 'voting'>('intro');
  const [dialogue, setDialogue] = useState("Welcome to ElectraGuide. I am your election assistant. Let's start with registration. Are you 18 years or older?");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState('national');
  const recognitionRef = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollStates = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const currentRegion = DASHBOARD_REGIONS.find(r => r.id === selectedRegionId) || DASHBOARD_REGIONS[0];

  const getAssistantText = useCallback((scene: string, step: number) => {
    if (scene === 'intro') {
      if (step === 0) return "Welcome to ElectraGuide. I am your election assistant. Let's start with registration. Are you 18 years or older?";
      if (step === 1) return "Great! To register, you'll need your Aadhaar card and a passport size photo. Do you have these ready?";
      if (step === 2) return "Excellent. You can now visit voters.eci.gov.in and fill Form 6. Once verified, you will receive your EPIC card.";
      return "Registration process complete!";
    }
    if (scene === 'voting') {
      if (step === 0) return "Now, let's learn how to vote on election day at the polling station. Are you ready?";
      if (step === 1) return "First, polling officials will check your name on the voter list and check your ID.";
      if (step === 2) return "Next, an official will ink your finger and take your sign. Then you proceed to the EVM.";
      if (step === 3) return "Finally, press the button next to your chosen candidate's symbol. Wait for the beep and check the VVPAT slip.";
      return "You have successfully voted!";
    }
    return "";
  }, []);

  const translateDialogue = useCallback(async (text: string, langCode: string) => {
    if (langCode === 'en') return text;
    
    // Check cache
    if (translationCache[langCode]?.[text]) {
      return translationCache[langCode][text];
    }

    const langName = LANGUAGES.find(l => l.code === langCode)?.name || langCode;
    const translated = await translateText(text, langName);
    
    // Update cache
    setTranslationCache(prev => ({
      ...prev,
      [langCode]: { ...(prev[langCode] || {}), [text]: translated }
    }));
    
    return translated;
  }, [translationCache]);

  useEffect(() => {
    const updateDialogue = async () => {
      const baseText = getAssistantText(assistantScene, assistantStep);
      const translated = await translateDialogue(baseText, language);
      setDialogue(translated);
    };
    updateDialogue();
  }, [assistantScene, assistantStep, language, getAssistantText, translateDialogue]);

  useEffect(() => {
    const translateUI = async () => {
      if (language === 'en') {
        setTranslatedUI({});
        return;
      }
      
      // If we already have translations for this language, we might want to skip 
      // but let's check if we have the specific labels needed.
      
      const langName = LANGUAGES.find(l => l.code === language)?.name || language;
      
      const labelsToTranslate = [
        "Interactive Guide", "Voter Journey", "Analytics Dashboard", "Fact Checker",
        "Welcome to ElectraGuide", "I am your election assistant", "Are you 18 or above?",
        "Registration Process", "How to Vote", "Interactive Map", "Priority Analytics",
        "START VOICE CONTROL", "STOP LISTENING", "National", "State", "Voter Demographics",
        "Voter Turnout", "Turnout Growth", "Gender Ratio", "Seat share %", "YES, I AM 18+",
        "I HAVE MY ID", "LEARN HOW TO VOTE", "Voter Participation (Turnout)", "SUCCESSFUL TURNOUT",
        "Election Summary Insights", "Regional Seat Distribution", "Full Party Analytics",
        "Detailed Vote Share vs Seats Breakdown", "Selected", "Reset Navigation", "Registration rate",
        "National share", "Urban-Rural gap", "National avg", "Turnout deviation", "Youth participation",
        "Election Assistant India", "Historical Analysis", "Demographics Breakdown",
        "Gender Distribution", "Age Groups", "Party Performance", "Vote Share",
        "Election Facts", "Identify Fake News", "Voter Registration Guide",
        "Step by Step Guide", "Polling Station Search", "Check Your Name"
      ];

      // Check which labels are missing from cache
      const missingLabels = labelsToTranslate.filter(label => !translationCache[language]?.[label]);
      
      if (missingLabels.length === 0) {
        // All labels are in cache, just set the UI state
        const uiTranslations: any = {};
        labelsToTranslate.forEach(label => {
          uiTranslations[label] = translationCache[language][label];
        });
        setTranslatedUI(uiTranslations);
        return;
      }
      
      // Batch translate only missing labels
      const newTranslations = await translateBatch(missingLabels, langName);
      
      // Update cache and set UI
      setTranslationCache(prev => {
        const updatedLangCache = { ...(prev[language] || {}), ...newTranslations };
        
        // Also update translatedUI state based on full cache to ensure all labels are present
        const uiTranslations: any = {};
        labelsToTranslate.forEach(label => {
          uiTranslations[label] = updatedLangCache[label] || label;
        });
        setTranslatedUI(uiTranslations);
        
        return {
          ...prev,
          [language]: updatedLangCache
        };
      });
    };
    translateUI();
  }, [language, translationCache]);

  const t = (text: string) => translatedUI[text] || text;

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: any = {
      en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', 
      ta: 'ta-IN', ur: 'ur-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', 
      pa: 'pa-IN', or: 'or-IN', as: 'as-IN', ks: 'ks-IN', sa: 'sa-IN'
    };
    const targetLang = langMap[language] || 'en-IN';
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === targetLang) || 
                  voices.find(v => v.lang.startsWith(language)) || 
                  voices.find(v => v.lang.startsWith('en-IN'));
    
    if (voice) utterance.voice = voice;
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  useEffect(() => {
    if (dialogue && activeTab === 'assistant') {
      speak(dialogue);
    }
  }, [dialogue, activeTab, speak]);

  const handleAssistantAction = useCallback((action: string) => {
    if (action === '18plus') {
      setAssistantStep(1);
    } else if (action === 'has-id') {
      setAssistantStep(2);
    } else if (action === 'go-voting') {
      setAssistantScene('voting');
      setAssistantStep(0);
    } else if (action === 'voting-step-1') {
      setAssistantStep(1);
    } else if (action === 'voting-step-2') {
      setAssistantStep(2);
    } else if (action === 'voting-step-3') {
      setAssistantStep(3);
    }
  }, []);

  // Voice Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      const langMap: any = {
        en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', 
        ta: 'ta-IN', ur: 'ur-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', 
        pa: 'pa-IN', or: 'or-IN', as: 'as-IN', ks: 'ks-IN', sa: 'sa-IN'
      };
      recognitionRef.current.lang = langMap[language] || 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')
          .toLowerCase();
        
        console.log('Voice Input:', transcript);

        // Improved logic for age verification
        if (transcript.includes('18') || transcript.includes('eighteen') || transcript.includes('year') || transcript.includes('umriya')) {
           handleAssistantAction('18plus');
        } else if (transcript.includes('yes') || transcript.includes('ha') || transcript.includes('ji')) {
           if (assistantScene === 'intro' && assistantStep === 0) handleAssistantAction('18plus');
           else if (assistantScene === 'intro' && assistantStep === 1) handleAssistantAction('has-id');
           else if (assistantScene === 'voting' && assistantStep === 0) handleAssistantAction('voting-step-1');
        } else if (transcript.includes('id') || transcript.includes('aadhaar')) {
          handleAssistantAction('has-id');
        } else if (transcript.includes('vote') || transcript.includes('voting')) {
          handleAssistantAction('go-voting');
        } else if (transcript.includes('step 1') || transcript.includes('first') || transcript.includes('pehla')) {
          handleAssistantAction('voting-step-1');
        } else if (transcript.includes('step 2') || transcript.includes('second') || transcript.includes('dusra')) {
          handleAssistantAction('voting-step-2');
        } else if (transcript.includes('step 3') || transcript.includes('third') || transcript.includes('teesra')) {
          handleAssistantAction('voting-step-3');
        }

        // Language Switch Voice Commands
        if (transcript.includes('hindi')) {
          setLanguage('hi');
        } else if (transcript.includes('english') || transcript.includes('angrezi')) {
          setLanguage('en');
        } else if (transcript.includes('bengali') || transcript.includes('bangla')) {
          setLanguage('bn');
        } else if (transcript.includes('telugu')) {
          setLanguage('te');
        } else if (transcript.includes('marathi')) {
          setLanguage('mr');
        } else if (transcript.includes('tamil')) {
          setLanguage('ta');
        } else if (transcript.includes('kannada')) {
          setLanguage('kn');
        } else if (transcript.includes('gujarati')) {
          setLanguage('gu');
        } else if (transcript.includes('punjabi')) {
          setLanguage('pa');
        } else if (transcript.includes('malayalam')) {
          setLanguage('ml');
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);

      if (isListening) {
        recognitionRef.current.start();
      }
    }
  }, [language, handleAssistantAction, isListening, assistantScene, assistantStep]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (activeTab === 'assistant') {
      if (assistantScene === 'intro') {
        speak("Welcome to ElectraGuide. I am your election assistant. Let's start with registration. Are you 18 years or older?");
      }
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, [activeTab, assistantScene, speak]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-orange-100 italic-serif">
      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }}
              src={zoomedImage} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(255,165,0,0.2)] border border-white/10"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white font-black italic tracking-widest text-xs"
            >
              CLICK TO CLOSE VIEW
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md">
              <Vote className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">ElectraGuide</h1>
              <p className="text-[10px] opacity-80 font-medium tracking-widest uppercase">{t("Welcome to ElectraGuide")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector current={language} onSelect={setLanguage} />
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-black text-white h-10 flex items-center overflow-hidden border-y border-orange-500/30">
        <div className="bg-orange-600 h-full px-4 flex items-center gap-2 z-10 skew-x-[-20deg] ml-[-10px]">
          <Zap className="w-4 h-4 fill-white skew-x-[20deg]" />
          <span className="text-xs font-black uppercase tracking-tighter skew-x-[20deg]">Live Updates</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div 
            animate={{ x: ['100%', '-100%'] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="whitespace-nowrap text-sm font-medium tracking-wide flex gap-20"
          >
            {[
              "Electoral Roll revision ongoing in all states.",
              "Download your e-EPIC from the Voter Portal today.",
              "1950 Helpline now available in 22 languages.",
              "Check your polling station location using Maps API."
            ].map((news, i) => (
              <span key={i} className="flex items-center gap-4">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                {news}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm sticky top-28 z-40">
          {(['assistant', 'journey', 'dashboard', 'misinformation'] as AppTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab === 'assistant' && <Play className="w-4 h-4" />}
              {tab === 'journey' && <MapPin className="w-4 h-4" />}
              {tab === 'dashboard' && <BarChart3 className="w-4 h-4" />}
              {tab === 'misinformation' && <ShieldAlert className="w-4 h-4" />}
              <span className="capitalize">
                {tab === 'assistant' ? t('Interactive Guide') : 
                 tab === 'journey' ? t('Voter Journey') :
                 tab === 'dashboard' ? t('Analytics Dashboard') :
                 t('Fact Checker')}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interactive Video Box */}
                <div className="lg:col-span-2 relative aspect-video bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-gray-800 group outline outline-1 outline-gray-700">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-40 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full" />
                    <div className="w-12 h-1 bg-gray-700 rounded-full" />
                  </div>
                  
                  {isSpeaking && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="absolute top-4 right-8 z-50 text-orange-500"
                    >
                      <Volume2 className="w-5 h-5 drop-shadow-lg" />
                    </motion.div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    
                    {/* Scene Visuals */}
                    <AnimatePresence mode="wait">
                      {assistantScene === 'voting' && assistantStep === 0 && (
                        <motion.img 
                          key="v-booth"
                          initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                          src={DOCUMENT_IMAGES.votingBooth} 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      {assistantScene === 'voting' && assistantStep >= 1 && (
                        <motion.img 
                          key="v-evm"
                          initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                          src={DOCUMENT_IMAGES.evmMachine} 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </AnimatePresence>

                    {/* Animated Avatar */}
                    <motion.div 
                      layout
                      className="text-center z-20"
                    >
                      <Avatar speaking={isSpeaking} listening={isListening} />
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={dialogue}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-white text-lg font-medium max-w-sm px-6 italic"
                        >
                          {dialogue}
                        </motion.p>
                      </AnimatePresence>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleListening}
                        className={`mt-6 mx-auto flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl ${
                          isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600/20 text-white hover:bg-blue-600/40 border border-blue-400/30 backdrop-blur-md'
                        }`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        {isListening ? t("STOP LISTENING") : t("START VOICE CONTROL")}
                      </motion.button>
                    </motion.div>

                    {/* Animated Background Rays */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(8)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
                          className="absolute top-1/2 left-1/2 w-full h-[2px] bg-white origin-left"
                          style={{ transform: `rotate(${i * 45}deg)` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Interactive Overlays */}
                  <AnimatePresence>
                    {assistantScene === 'intro' && assistantStep === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-black/40 flex items-end justify-center p-12 z-30"
                      >
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleAssistantAction('18plus')}
                            className="bg-orange-600 hover:bg-orange-700 px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-transform active:scale-95 uppercase tracking-wider"
                          >
                            {t("YES, I AM 18+") || "YES, I AM 18+"}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {assistantScene === 'intro' && assistantStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-black/40 flex items-end justify-center p-12 z-30"
                      >
                            <button 
                              onClick={() => handleAssistantAction('has-id')}
                              className="bg-orange-600 hover:bg-orange-700 px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-transform active:scale-95 uppercase tracking-wider"
                            >
                              {t("I HAVE MY ID")}
                            </button>
                      </motion.div>
                    )}

                    {assistantScene === 'intro' && assistantStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-black/40 flex items-end justify-center p-12 z-30"
                      >
                        <button 
                          onClick={() => handleAssistantAction('go-voting')}
                          className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-transform active:scale-95"
                        >
                          TEACH ME HOW TO VOTE
                        </button>
                      </motion.div>
                    )}

                    {assistantScene === 'voting' && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-black/40 flex items-end justify-center p-12 z-30"
                      >
                        <div className="flex flex-wrap gap-2 justify-center">
                          {assistantStep === 0 && (
                            <button onClick={() => handleAssistantAction('voting-step-1')} className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl font-bold text-white shadow-lg">START STEP 1</button>
                          )}
                          {assistantStep === 1 && (
                            <button onClick={() => handleAssistantAction('voting-step-2')} className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl font-bold text-white shadow-lg">CONTINUE TO STEP 2</button>
                          )}
                          {assistantStep === 2 && (
                            <button onClick={() => handleAssistantAction('voting-step-3')} className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl font-bold text-white shadow-lg">CONTINUE TO STEP 3</button>
                          )}
                          {assistantStep === 3 && (
                            <div className="text-center">
                               <p className="text-white font-black italic mb-4">YOU HAVE SUCCESSFULLY VOTED!</p>
                               <button onClick={() => {setAssistantScene('intro'); setAssistantStep(0);}} className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold">RESTART GUIDE</button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Requirements & Documents */}
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tighter italic">
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                       Required Documents
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2 text-center">
                        <div className="relative group/id cursor-zoom-in" onClick={() => setZoomedImage(DOCUMENT_IMAGES.aadhaar)}>
                          <img src={DOCUMENT_IMAGES.aadhaar} alt="Aadhaar" className="w-full aspect-square object-cover rounded-xl border border-gray-100 transition-transform group-hover/id:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/id:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                            <span className="text-white text-[8px] font-bold">VIEW ORIGINAL</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">ORIGINAL ID</p>
                      </div>
                      <div className="space-y-2 text-center">
                        <div className="relative group/photo cursor-zoom-in" onClick={() => setZoomedImage(DOCUMENT_IMAGES.photo)}>
                          <img src={DOCUMENT_IMAGES.photo} alt="Photo" className="w-full aspect-square object-cover rounded-xl border border-gray-100 transition-transform group-hover/photo:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                            <span className="text-white text-[8px] font-bold">VIEW CLEAR</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">SELFIE PHOTO</p>
                      </div>
                      <div className="space-y-2 text-center">
                        <div className="relative group/map cursor-zoom-in" onClick={() => setZoomedImage(DOCUMENT_IMAGES.address)}>
                          <img src={DOCUMENT_IMAGES.address} alt="Mapping" className="w-full aspect-square object-cover rounded-xl border border-gray-100 transition-transform group-hover/map:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/map:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                            <span className="text-white text-[8px] font-bold">VIEW MAP</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">MAP LOCATION</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black text-white p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="w-5 h-5 text-orange-500" />
                      <span className="font-black italic uppercase tracking-tighter text-sm">Voter Tip</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-serif">
                       Keep your <span className="text-orange-400 font-bold">Aadhaar</span> linked with your phone for instant OTP verification during Form 6 submission.
                    </p>
                  </div>

                  <button 
                    onClick={() => {setAssistantStep(0); setProfile({ hasId: false, language: 'en' }); if(window.speechSynthesis) window.speechSynthesis.cancel();}}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 font-bold transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Assistant
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 max-w-7xl mx-auto pb-12"
            >
              {/* Power BI Style Dashboard Header */}
              <div className="bg-[#5C458E]/10 p-4 rounded-xl border border-[#5C458E]/30 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_India.png" className="h-8 object-contain rounded" alt="India Flag" />
                    <h2 className="text-3xl font-black text-[#5C458E] uppercase tracking-tighter italic text-center md:text-left">
                      {currentRegion.name} ANALYTICS
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => scrollStates('left')}
                      className="p-2 bg-white rounded-full border border-purple-100 hover:bg-gray-50 text-[#5C458E]"
                    >
                      <motion.div whileTap={{ scale: 0.8 }}><ChevronRight className="w-4 h-4 rotate-180" /></motion.div>
                    </button>
                    
                    <div className="w-[320px] overflow-hidden">
                      <div 
                        ref={scrollContainerRef}
                        className="flex gap-2 p-1 overflow-x-hidden transition-all duration-300"
                      >
                         {DASHBOARD_REGIONS.map(reg => (
                           <button
                             key={reg.id}
                             onClick={() => setSelectedRegionId(reg.id)}
                             className={`flex-shrink-0 w-24 px-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center ${
                                selectedRegionId === reg.id 
                                ? 'bg-[#5C458E] text-white shadow-lg' 
                                : 'bg-white text-gray-400 border border-purple-50 hover:bg-gray-100'
                             }`}
                           >
                             {reg.id === 'national' ? t('National') : t(reg.name)}
                           </button>
                         ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => scrollStates('right')}
                      className="p-2 bg-white rounded-full border border-purple-100 hover:bg-gray-50 text-[#5C458E]"
                    >
                      <motion.div whileTap={{ scale: 0.8 }}><ChevronRight className="w-4 h-4" /></motion.div>
                    </button>
                  </div>
                </div>
              </div>

                <div className="lg:col-span-12 space-y-6">
                  {/* Map & Demographics Top Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm relative group">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest text-center italic">Interactive Map Dashboard: Selection changes analytical data below</p>
                      <div className="relative">
                        <img 
                          src="https://www.worldatlas.com/r/w1200/upload/ce/81/b5/artboard-1.png" 
                          className="h-[450px] w-full object-contain"
                          alt="India Map"
                        />
                        {/* Dynamic Hotspots for all regions */}
                        {DASHBOARD_REGIONS.filter(r => r.id !== 'national').map(reg => (
                          <div 
                            key={reg.id}
                            onClick={() => setSelectedRegionId(reg.id)}
                            style={{ top: reg.mapCoords.top, left: reg.mapCoords.left }}
                            className={`absolute w-10 h-10 rounded-full cursor-pointer transition-all flex items-center justify-center -translate-x-1/2 -translate-y-1/2 ${selectedRegionId === reg.id ? 'bg-purple-600/40 ring-4 ring-purple-600/20' : 'bg-purple-600/10 hover:bg-purple-600/20'}`}
                          >
                             <div className={`w-2.5 h-2.5 rounded-full ${selectedRegionId === reg.id ? 'bg-purple-600 scale-125' : 'bg-purple-400 opacity-60'} transition-all`} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-between items-center px-4">
                         <div className="flex items-center gap-2">
                           <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
                           <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{t("Selected")}: {t(currentRegion.name)}</span>
                         </div>
                         <button 
                           onClick={() => setSelectedRegionId('national')}
                           className="text-[8px] font-black tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors uppercase"
                         >
                           {t("Reset Navigation")}
                         </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col overflow-hidden">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest text-center italic">{t("Priority Analytics")}</p>
                      
                      <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                         {/* KPI 1 & 2 */}
                         <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                               <p className="text-[7px] font-black text-green-700 uppercase mb-0.5">{t("Voter Turnout")}</p>
                               <p className="text-lg font-black text-green-800 italic">{currentRegion.participation[0].value}%</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                               <p className="text-[7px] font-black text-blue-700 uppercase mb-0.5">{t("Turnout Growth")}</p>
                               <p className="text-lg font-black text-blue-800 italic">
                                 {((currentRegion.participation[0].value - currentRegion.previousTurnout) / currentRegion.previousTurnout * 100).toFixed(1)}%
                               </p>
                            </div>
                         </div>
                         {/* KPI 3 & 4 */}
                         <div className="grid grid-cols-2 gap-2">
                            <div className="bg-pink-50 p-3 rounded-xl border border-pink-100">
                               <p className="text-[7px] font-black text-pink-700 uppercase mb-0.5">{t("Gender Ratio")}</p>
                               <p className="text-lg font-black text-pink-800 italic">{(currentRegion.demographics.female / currentRegion.demographics.male).toFixed(2)}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                               <p className="text-[7px] font-black text-orange-700 uppercase mb-0.5">{t("Seat share %")}</p>
                               <p className="text-lg font-black text-orange-800 italic">
                                 {(Math.max(...currentRegion.partyResults.map(p => p.value)) / currentRegion.totalSeats * 100).toFixed(1)}%
                               </p>
                            </div>
                         </div>
                         {/* KPI 5 & 6 */}
                         <div className="grid grid-cols-2 gap-2">
                            <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                               <p className="text-[7px] font-black text-purple-700 uppercase mb-0.5">{t("National share")}</p>
                               <p className="text-lg font-black text-purple-800 italic">
                                 {(currentRegion.votersNum / DASHBOARD_REGIONS.find(r => r.id === 'national')!.votersNum * 100).toFixed(1)}%
                               </p>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                               <p className="text-[7px] font-black text-amber-700 uppercase mb-0.5">{t("Urban-Rural gap")}</p>
                               <p className="text-lg font-black text-amber-800 italic">{(currentRegion.urbanTurnout - currentRegion.ruralTurnout).toFixed(1)}%</p>
                            </div>
                         </div>
                         {/* KPI 7 & 8 */}
                         <div className="grid grid-cols-2 gap-2">
                            <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                               <p className="text-[7px] font-black text-teal-700 uppercase mb-0.5">{t("National avg")}</p>
                               <p className="text-lg font-black text-teal-800 italic">
                                 {(DASHBOARD_REGIONS.reduce((acc, curr) => acc + curr.participation[0].value, 0) / DASHBOARD_REGIONS.length).toFixed(1)}%
                               </p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                               <p className="text-[7px] font-black text-red-700 uppercase mb-0.5">{t("Turnout deviation")}</p>
                               <p className="text-lg font-black text-red-800 italic">
                                 {(currentRegion.participation[0].value - (DASHBOARD_REGIONS.reduce((acc, curr) => acc + curr.participation[0].value, 0) / DASHBOARD_REGIONS.length)).toFixed(1)}%
                               </p>
                            </div>
                         </div>
                         {/* KPI 9 & 10 */}
                         <div className="grid grid-cols-2 gap-2">
                            <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
                               <p className="text-[7px] font-black text-sky-700 uppercase mb-0.5">{t("Youth participation")}</p>
                               <p className="text-lg font-black text-sky-800 italic">
                                 {(currentRegion.youthVoters / currentRegion.votersNum * 100).toFixed(1)}%
                               </p>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                               <p className="text-[7px] font-black text-indigo-700 uppercase mb-0.5">{t("Registration rate")}</p>
                               <p className="text-lg font-black text-indigo-800 italic">
                                 {(currentRegion.votersNum / currentRegion.populationNum * 100).toFixed(1)}%
                               </p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Previous 10 KPI grid removed as they are now in the sidebar */}


                  {/* Mid Row: Participation & Summary Side-by-Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm relative group overflow-hidden">
                       <h4 className="text-[10px] font-black uppercase text-gray-400 mb-8 tracking-widest text-center italic">{t("Voter Participation (Turnout)")}</h4>
                       <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={currentRegion.participation}
                               cx="50%"
                               cy="50%"
                               innerRadius={70}
                               outerRadius={100}
                               paddingAngle={10}
                               dataKey="value"
                             >
                               {currentRegion.participation.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                               ))}
                             </Pie>
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '10px', fontWeight: 900 }}
                             />
                           </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4 mt-8">
                            <p className="text-5xl font-black text-[#059669] italic">{currentRegion.participation[0].value}%</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t("SUCCESSFUL TURNOUT")}</p>
                         </div>
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm relative overflow-hidden">
                       <h4 className="text-[10px] font-black uppercase text-gray-400 mb-8 tracking-widest text-center italic">{t("Election Summary Insights")}</h4>
                       <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={currentRegion.partyResults.filter(p => p.value > 0)}
                               cx="50%"
                               cy="50%"
                               innerRadius={0}
                               outerRadius={80}
                               paddingAngle={2}
                               dataKey="value"
                             >
                               {currentRegion.partyResults.filter(p => p.value > 0).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                               ))}
                             </Pie>
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '10px', fontWeight: 900 }}
                             />
                           </PieChart>
                         </ResponsiveContainer>
                       </div>
                       <p className="text-[8px] font-black text-gray-400 text-center uppercase tracking-widest mt-4">{t("Regional Seat Distribution")}</p>
                    </div>
                  </div>

                  {/* Bottom Panel: Party Analytics */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                        <div>
                          <h4 className="text-2xl font-black text-[#5C458E] italic uppercase tracking-tight">{t("Full Party Analytics")}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("Detailed Vote Share vs Seats Breakdown")}</p>
                        </div>
                        <div className="flex gap-4">
                           {currentRegion.partyResults.slice(0, 3).map(p => (
                             <div key={p.name} className="flex flex-col items-center bg-gray-50 px-4 py-2 rounded-xl">
                                <span className="text-[10px] font-black opacity-40 uppercase">{p.name}</span>
                                <span className="text-lg font-black italic" style={{ color: p.color }}>{p.value} Seats</span>
                             </div>
                           ))}
                        </div>
                      </div>

                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={currentRegion.partyResults} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                            />
                            <YAxis 
                               axisLine={false} 
                               tickLine={false} 
                               tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                            />
                            <Tooltip 
                               cursor={{ fill: 'rgba(92, 69, 142, 0.05)' }}
                               contentStyle={{ 
                                 borderRadius: '16px', 
                                 border: 'none', 
                                 boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                 padding: '16px'
                               }}
                               formatter={(value: number) => [`${(value / 1000000).toFixed(2)}M`, 'Voters']}
                            />
                            <Bar dataKey="voters" radius={[6, 6, 0, 0]}>
                              {currentRegion.partyResults.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                              {/* Custom label for BJP and INC icons */}
                              <LabelList 
                                dataKey="name" 
                                position="top" 
                                content={(props: any) => {
                                  const { x, y, width, value } = props;
                                  if (value === 'BJP' || value === 'BJP+') {
                                    return (
                                      <image 
                                        x={x + width / 2 - 15} 
                                        y={y - 35} 
                                        width={30} 
                                        height={30} 
                                        href="https://www.peacockride.com/cdn/shop/files/bjp1Asset2_grande.jpg?v=1714730711" 
                                      />
                                    );
                                  }
                                  if (value === 'INC' || value === 'INC+') {
                                    return (
                                      <image 
                                        x={x + width / 2 - 15} 
                                        y={y - 35} 
                                        width={30} 
                                        height={30} 
                                        href="https://m.media-amazon.com/images/I/51cbGr35ZVS._AC_UF1000,1000_QL80_.jpg" 
                                      />
                                    );
                                  }
                                  return null;
                                }} 
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
          )}

          {activeTab === 'journey' && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-xl"
            >
              <SectionHeading icon={MapPin}>Your Personalized Voter Journey</SectionHeading>
              
              <div className="grid md:grid-cols-4 gap-4 relative">
                <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gray-100" />
                
                {[
                  { step: 'Check Eligibility', desc: 'Verify age and citizenship status', status: assistantStep >= 1 ? 'completed' : 'current' },
                  { step: 'Gather Documents', desc: 'Prepare Photo, Address & ID proof', status: assistantStep >= 2 ? 'completed' : 'pending' },
                  { step: 'Submit Form 6', desc: 'Fill details in online portal', status: 'pending' },
                  { step: 'Verification', desc: 'BLO local visit & confirmation', status: 'pending' },
                ].map((s, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 z-10 transition-all ${
                      s.status === 'completed' ? 'bg-green-100 text-green-600' :
                      s.status === 'current' ? 'bg-orange-600 text-white shadow-lg' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {s.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{i + 1}</span>}
                    </div>
                    <h5 className="font-bold text-gray-900 mb-1">{s.step}</h5>
                    <p className="text-xs text-gray-500 leading-relaxed px-4">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Calendar className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Upcoming Milestone: Special Summary Revision</h4>
                    <p className="text-gray-600 max-w-2xl">
                      The Special Summary Revision of Electoral Rolls usually starts in <span className="font-bold">October-November</span> each year. Ensure your data is updated during this period.
                    </p>
                    <div className="mt-4 flex gap-4">
                      <div className="bg-white px-4 py-2 rounded-xl border border-gray-200">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Days Remaining</p>
                        <p className="text-2xl font-black text-orange-600">142</p>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-xl border border-gray-200">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Registration Status</p>
                        <p className="text-2xl font-black text-blue-600">Open</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'misinformation' && (
            <motion.div
              key="misinformation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="inline-flex p-4 bg-orange-100 rounded-3xl mb-4">
                  <ShieldAlert className="w-12 h-12 text-orange-600" />
                </div>
                <h2 className="text-4xl font-bold italic tracking-tight mb-4">Stay Safe from Fake News</h2>
                <p className="text-gray-500 max-w-xl mx-auto">
                  Misinformation spreads 6x faster during elections. Use these simple audit steps to verify any message you receive.
                </p>
              </div>

              <div className="space-y-4">
                {FAKE_NEWS_TIPS.map(tip => (
                  <div key={tip.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex gap-6 group hover:border-orange-200 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-gray-300 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0">
                      0{tip.id}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{tip.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-blue-600 text-white rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h4 className="text-2xl font-bold mb-2">Think before you link.</h4>
                  <p className="text-blue-100 opacity-80 text-sm">
                    Verified election results are only available on **results.eci.gov.in**. Do not trust unofficial dashboards during counting days.
                  </p>
                </div>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-50 transition-colors shrink-0">
                  Join Fact-Check Group
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Fact Footer */}
      <footer className="mt-20 bg-gray-100 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h5 className="font-bold text-gray-900 mb-4 opacity-30 uppercase tracking-widest text-xs">Official Resources</h5>
            <div className="grid grid-cols-2 gap-4">
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-orange-600 font-serif italic">cVIGIL Portal</a>
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-orange-600 font-serif italic">Voter Helpline (1950)</a>
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-orange-600 font-serif italic">Know Your Candidate</a>
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-orange-600 font-serif italic">Voter Education (SVEEP)</a>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col justify-end items-end">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Designed for the Indian Republic</p>
            <div className="flex gap-4">
               <div className="h-0.5 w-12 bg-orange-400" />
               <div className="h-0.5 w-12 bg-white" />
               <div className="h-0.5 w-12 bg-green-400" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
