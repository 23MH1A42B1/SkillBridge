import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { evaluateMockAnswer } from '../services/interviewService';
import Typewriter from '../components/Typewriter';

const NegotiationVisualizer = ({ score = 70 }) => {
  return (
    <div className="w-full h-24 bg-white/5 rounded-2xl border border-white/5 overflow-hidden flex items-end gap-1 px-4 pb-4">
      {Array.from({ length: 40 }).map((_, i) => {
        const isActive = (i / 40) * 100 < score;
        return (
          <div 
            key={i} 
            className={`flex-1 rounded-t-sm transition-all duration-500 ${isActive ? 'bg-brand-500 shadow-neon-glow' : 'bg-white/10'}`}
            style={{ height: `${Math.random() * 40 + 20}%`, opacity: isActive ? 1 : 0.2 }}
          />
        );
      })}
    </div>
  );
};

export default function Negotiator() {
  const { user, profile } = useAuth();
  const [stage, setStage] = useState('briefing'); // briefing | action | debrief
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [negotiationScore, setNegotiationScore] = useState(50);
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  const persona = {
    name: 'Sarah Chen',
    role: 'Head of Talent Acquisition',
    avatar: '👩‍💼',
    mood: 'Neutral but Firm',
    prompt: "You are Sarah Chen, Head of Talent Acquisition at a top-tier tech firm. A candidate is negotiating their offer. You are firm but fair. You have a budget but want the best talent. Respond to the candidate's arguments for a higher salary or better benefits."
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Use the existing evaluateMockAnswer as a base for negotiation feedback
      const feedback = await evaluateMockAnswer("Negotiate your salary for a Senior Role", input, "Senior Software Engineer", "griller");
      
      const aiResponse = { 
        role: 'assistant', 
        content: feedback.feedback,
        scoreDelta: feedback.score - 5
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setNegotiationScore(prev => Math.min(100, Math.max(0, prev + aiResponse.scoreDelta)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Salary Negotiation Arena</h1>
            <p className="text-gray-500 font-medium">Practice high-stakes negotiations with elite AI recruiters.</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">Confidence Score</span>
            <div className="text-3xl font-black text-brand-400">{negotiationScore}%</div>
          </div>
        </header>

        {stage === 'briefing' ? (
          <div className="glass-card p-12 text-center animate-slide-up">
            <div className="text-6xl mb-8">💼</div>
            <h2 className="text-2xl font-black text-white mb-4">You've received an offer!</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
              The company has offered you **$140,000** base salary. Your goal is to negotiate for **$160,000** or more, plus a signing bonus, by highlighting your unique value and market data.
            </p>
            <button 
              onClick={() => {
                setStage('action');
                setMessages([{ role: 'assistant', content: "Hi there. We're really excited to have you join the team. I hope you've had a chance to review the offer letter. Do you have any questions or thoughts on the compensation package?" }]);
              }}
              className="btn-primary px-12 py-4 rounded-full shadow-neon-glow font-black uppercase tracking-widest"
            >
              Enter Negotiation →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            
            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Interviewer</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl">{persona.avatar}</div>
                  <div>
                    <div className="font-black text-white text-sm">{persona.name}</div>
                    <div className="text-[10px] text-brand-400 font-black uppercase">{persona.role}</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                   <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Current Mood</p>
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-1/2"></div>
                      </div>
                      <span className="text-[10px] font-black text-amber-500 uppercase">{persona.mood}</span>
                   </div>
                </div>
              </div>

              <div className="glass-card p-6">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Negotiation Health</h3>
                 <NegotiationVisualizer score={negotiationScore} />
              </div>
            </div>

            {/* Chat Arena */}
            <div className="md:col-span-2 glass-card flex flex-col h-[600px] overflow-hidden">
               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] p-6 rounded-3xl font-medium leading-relaxed ${m.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
                          {m.role === 'assistant' ? <Typewriter text={m.content} speed={20} /> : m.content}
                       </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                       <div className="bg-white/5 p-4 rounded-2xl animate-pulse flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-6 bg-white/[0.02] border-t border-white/5">
                  <div className="flex gap-4">
                     <input 
                       type="text"
                       value={input}
                       onChange={e => setInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleSend()}
                       placeholder="Propose your counter-offer..."
                       className="flex-1 bg-dark-bg border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                     />
                     <button 
                       onClick={handleSend}
                       disabled={loading || !input.trim()}
                       className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white hover:bg-brand-700 transition-all shadow-neon-glow disabled:opacity-50"
                     >
                       🚀
                     </button>
                  </div>
                  <p className="mt-3 text-[9px] text-gray-600 font-black uppercase text-center tracking-widest">Type your response and hit Enter to negotiate</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
