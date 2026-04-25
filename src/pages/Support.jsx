import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { startOrGetChat, sendMessage, subscribeToMessages } from '../services/supportService';

export default function Support() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (user) {
      startOrGetChat(user.uid, profile?.fullName || user.email);
      const unsubscribe = subscribeToMessages(user.uid, (msgs) => {
        setMessages(msgs);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
      return unsubscribe;
    }
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setLoading(true);
    try {
      await sendMessage(user.uid, inputText, 'user', profile?.fullName || user.email);
      setInputText('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Support Chat</h1>
        <p className="text-slate-400 text-sm">Need help? Chat with our team in real-time. We usually respond within minutes.</p>
      </div>

      <div className="flex-1 glass-card flex flex-col overflow-hidden border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <p className="text-white font-semibold">SkillBridge Support Team</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Agents Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/30 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4 grayscale opacity-50">
                💬
              </div>
              <h3 className="text-white font-bold text-lg">No messages yet</h3>
              <p className="text-slate-500 text-sm max-w-xs">Ask us anything about job matching, resume analysis, or platform features!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-500 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[10px] font-medium ${msg.role === 'user' ? 'text-brand-100' : 'text-slate-500'}`}>
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] opacity-40">•</span>
                    <span className={`text-[10px] ${msg.role === 'user' ? 'text-brand-100' : 'text-slate-500'}`}>
                      {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-slate-800/50 border-t border-slate-700 flex gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to support..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            {loading ? '...' : (
              <>
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
