import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';

/**
 * GlobalAssistant — A floating AI Chat Assistant available on every page.
 * Replaces the voice-only commander with a full chat interface.
 */
export default function GlobalAssistant() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userSkills, setUserSkills] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${profile?.fullName?.split(' ')[0] || ''}! I’m your SkillBridge AI Strategist. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  // Load User Skills for context
  useEffect(() => {
    async function load() {
      if (user?.uid) {
        const skills = await getUserSkills(user.uid);
        setUserSkills(skills);
      }
    }
    load();
  }, [user]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event) => {
        const cmd = event.results[0][0].transcript;
        handleSend(cmd);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Context gathering
    const currentPage = window.location.pathname;
    const userContext = {
      name: profile?.fullName || 'User',
      role: profile?.desiredRole || 'Tech Professional',
      skills: userSkills?.skills?.technical?.slice(0, 5).join(', ') || 'Not analyzed yet',
      currentPage: currentPage
    };

    // Command patterns for navigation
    const lowerText = text.toLowerCase();
    if (lowerText.includes('dashboard')) navigate('/dashboard');
    if (lowerText.includes('report')) navigate('/career-report');
    if (lowerText.includes('coach') || lowerText.includes('assistant')) navigate('/career-coach');
    if (lowerText.includes('jobs')) navigate('/jobs');

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { 
              role: "system", 
              content: `You are the SkillBridge Elite AI Strategist. You are talking to ${userContext.name}, a ${userContext.role} with expertise in ${userContext.skills}. 
              They are currently on the ${userContext.currentPage} page. 
              Your goal is to provide proactive, elite career guidance. If they ask about the platform, explain features like the 'AI Interview Simulator' or 'Market Intelligence'. 
              Be highly strategic, concise, and sound like a human executive partner, not a robot.` 
            },
            ...messages.slice(-5), 
            userMsg
          ],
          temperature: 0.8
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a temporary connectivity issue. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 print:hidden">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] h-[450px] bg-dark-card border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slide-up mb-2">
          {/* Header */}
          <div className="p-5 border-b border-white/5 bg-brand-600/10 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs shadow-neon-glow">🤖</div>
                <div>
                   <h4 className="text-white text-xs font-black uppercase tracking-widest">AI Assistant</h4>
                   <p className="text-[10px] text-brand-400 font-bold uppercase tracking-tight">Always Active</p>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-brand-400 font-black uppercase tracking-widest animate-pulse">AI is thinking...</div>}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5">
            <div className="flex gap-2">
               <button 
                 onClick={toggleVoice}
                 className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white'}`}
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                 </svg>
               </button>
               <input 
                 type="text" 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Ask anything..."
                 className="flex-1 bg-dark-bg border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
               />
               <button 
                 onClick={() => handleSend()}
                 disabled={!input.trim() || loading}
                 className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white hover:bg-brand-700 disabled:opacity-50"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group overflow-hidden
          ${isOpen ? 'bg-dark-card border border-white/20' : 'bg-brand-600 shadow-neon-glow hover:scale-110'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}

        {!isOpen && (
           <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-dark-bg rounded-full animate-bounce" />
        )}
      </button>
    </div>
  );
}
