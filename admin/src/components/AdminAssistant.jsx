import React, { useState, useEffect, useRef } from 'react';
import { getStats } from '../services/adminService';
import { chatWithAdminData } from '../services/aiService';

export default function AdminAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your SkillBridge Admin AI. I have access to your live platform stats. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Pre-fetch stats when opened so AI has context
    if (isOpen && !stats) {
      getStats().then(s => {
        // We only pass a summary to avoid huge payloads
        const summary = {
          totalUsers: s.totalUsers,
          usersWithResumes: s.withResumes,
          totalJobMatches: s.totalMatches,
          avgAtsScore: s.avgAtsScore,
          activeToday: s.activeToday,
          active7d: s.active7d
        };
        setStats(summary);
      }).catch(console.error);
    }
  }, [isOpen, stats]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Ensure we have stats before sending
      let currentStats = stats;
      if (!currentStats) {
        const s = await getStats();
        currentStats = {
          totalUsers: s.totalUsers,
          usersWithResumes: s.withResumes,
          totalJobMatches: s.totalMatches,
          avgAtsScore: s.avgAtsScore,
          activeToday: s.activeToday,
          active7d: s.active7d
        };
        setStats(currentStats);
      }

      const reply = await chatWithAdminData(userMsg, currentStats);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "⚠️ " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div 
        className={`pointer-events-auto transition-all duration-300 origin-bottom-right mb-4 glass-card overflow-hidden flex flex-col shadow-2xl ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        style={{ width: '350px', height: '450px', border: '1px solid rgba(13, 148, 136, 0.3)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="text-white font-semibold text-sm">Ask the Data</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#07080f]/90">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-500/20 border border-brand-500/30 text-white rounded-br-none' 
                    : 'bg-admin-hover border border-admin-border text-slate-300 rounded-bl-none'
                }`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-admin-hover border border-admin-border rounded-xl rounded-bl-none p-3 text-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-admin-border bg-admin-card flex-shrink-0 flex gap-2">
          <input 
            type="text" 
            className="input-field py-2 text-xs flex-1"
            placeholder="Ask about users, scores..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          >
            ↑
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg hover:shadow-neon-glow flex items-center justify-center text-2xl transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? '✕' : '✨'}
      </button>

    </div>
  );
}
