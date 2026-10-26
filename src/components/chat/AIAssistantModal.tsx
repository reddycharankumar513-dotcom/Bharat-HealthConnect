import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  AlertTriangle, 
  User, 
  Search, 
  Calendar, 
  Building2, 
  Pill, 
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: () => void }[];
  links?: { label: string; path: string }[];
}

export const AIAssistantModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, language } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting: Record<string, string> = {
    en: "Namaste! I am Bharat HealthConnect AI Assistant. How can I assist you today with doctors, hospitals, medicines, diagnostic tests, or ABHA health schemes?",
    hi: "नमस्ते! मैं भारत हेल्थकनेक्ट एआई सहायक हूँ। मैं आज आपकी डॉक्टरों, अस्पतालों, दवाओं, या आयुष्मान भारत योजनाओं के बारे में क्या मदद कर सकता हूँ?",
    te: "నమస్కారం! నేను భారత్ హెల్త్‌కనెక్ట్ AI అసిస్టెంట్‌ని. వైద్యులు, ఆసుపత్రులు, మందులు మరియు ఆరోగ్య పథకాల గురించి నేను మీకు ఎలా సహాయపడగలను?",
    ta: "வணக்கம்! நான் பாரத் ஹெல்த்கனெக்ட் AI உதவியாளர். மருத்துவர்கள், மருத்துவமனைகள், மருந்துகள் மற்றும் திட்டங்கள் பற்றி நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?"
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: initialGreeting[language] || initialGreeting.en,
      timestamp: 'Just now',
      links: [
        { label: 'Find Cardiologists in Hyderabad', path: '/doctors' },
        { label: 'Explore Apollo Health City', path: '/hospitals/hosp-1' },
        { label: 'Book Diagnostic Blood Test', path: '/laboratory/catalog' },
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isAiModalOpen) return null;

  const quickQuestions = [
    'How do I book a doctor appointment?',
    'Find best cardiology hospitals near me',
    'What tests are in the Comprehensive Lipid Profile?',
    'How does Ayushman Bharat PM-JAY scheme work?',
    'Emergency helpline numbers in India'
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate intelligent healthcare triage & search response
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = "I can guide you through Bharat HealthConnect. You can navigate through our verified network of public and private hospitals, search specialists, and track lab reports digitally.";
      let links: { label: string; path: string }[] | undefined = undefined;

      if (lower.includes('book') || lower.includes('appointment')) {
        reply = "To book an appointment: 1. Head to Doctor Search or Hospital Discovery. 2. Choose your specialist and preferred consultation type (In-person or Tele-consultation). 3. Select an available time slot and confirm. Your slot will be reserved immediately!";
        links = [
          { label: 'View Verified Doctors', path: '/doctors' },
          { label: 'My Appointments', path: '/patient/appointments' }
        ];
      } else if (lower.includes('cardio') || lower.includes('heart')) {
        reply = "For cardiology care, we recommend Dr. Rajeshwar Rao (MD, DM Interventional Cardiology at Apollo Health City, Hyderabad) and AIIMS Cardiothoracic Institute in Delhi. Both offer state-of-the-art cardiovascular cath labs and 24x7 trauma care.";
        links = [
          { label: 'Dr. Rajeshwar Rao Profile', path: '/doctors' },
          { label: 'Apollo Health City Details', path: '/hospitals/hosp-1' }
        ];
      } else if (lower.includes('lipid') || lower.includes('test') || lower.includes('blood') || lower.includes('lab')) {
        reply = "The Comprehensive Lipid Profile includes Total Cholesterol, Triglycerides, HDL ('good') cholesterol, LDL ('bad') cholesterol, and VLDL. A 10-12 hour fasting period is required before blood sample collection.";
        links = [
          { label: 'Diagnostic Test Catalog', path: '/laboratory/catalog' },
          { label: 'Sample Tracking', path: '/laboratory/samples' }
        ];
      } else if (lower.includes('emergency') || lower.includes('ambulance') || lower.includes('help')) {
        reply = "EMERGENCY ALERT: If this is a life-threatening medical emergency, call 112 (National Emergency), 108 (Emergency Ambulance), or 102 (Pregnancy/Child). Apollo Emergency: 1066. AIIMS Trauma: +91 11 2659 4705.";
        links = [
          { label: 'Open Emergency Services Center', path: '/emergency' }
        ];
      } else if (lower.includes('ayushman') || lower.includes('pmjay') || lower.includes('scheme') || lower.includes('insurance')) {
        reply = "Ayushman Bharat PM-JAY offers up to ₹5,00,000 cashless health cover per family per year for secondary and tertiary hospitalization across 27,000+ empanelled hospitals. You can verify your ABHA ID directly through your patient profile.";
        links = [
          { label: 'View Schemes & Invoices', path: '/patient/payments' },
          { label: 'Patient Profile & ABHA', path: '/patient/profile' }
        ];
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'assistant-' + Date.now(),
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          links
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col h-[90vh] sm:h-[620px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-medblue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bot className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Bharat HealthConnect AI</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[10px] font-semibold uppercase tracking-wider border border-teal-400/30">
                  Assistant
                </span>
              </div>
              <p className="text-xs text-teal-100/80">Care Navigation, Facility Search & FAQs</p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Health Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p>
            <strong>Medical Disclaimer:</strong> This AI provides health navigation assistance only, not medical diagnosis. For life-threatening emergencies, call <strong>112</strong> or <strong>108</strong>.
          </p>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white shadow-xs rounded-br-xs'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-subtle rounded-bl-xs'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Helpful navigation links */}
                {msg.links && msg.links.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">Quick Actions:</span>
                    {msg.links.map((link, idx) => (
                      <Link
                        key={idx}
                        to={link.path}
                        onClick={() => setIsAiModalOpen(false)}
                        className="inline-flex items-center justify-between px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-medium transition-colors"
                      >
                        <span>{link.label}</span>
                        <span>→</span>
                      </Link>
                    ))}
                  </div>
                )}

                <span className={`block text-[10px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                }`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-subtle">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-500 text-xs ml-1 font-medium">Assistant searching medical network...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
          <span className="text-[11px] text-slate-400 font-medium">Suggestions:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-full text-xs transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about doctors, hospitals, tests, or schemes..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-xl shadow-xs transition-colors"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
