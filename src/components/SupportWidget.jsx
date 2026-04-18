import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { startOrGetChat, sendMessage, subscribeToMessages } from '../services/supportService';

export default function SupportWidget() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      const unsubscribe = subscribeToMessages(user.uid, (msgs) => {
        setMessages(msgs);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
      return unsubscribe;
    }
  }, [isOpen, user]);

  const handleOpen = async () => {
    if (!user) return;
    setIsOpen(true);
    await startOrGetChat(user.uid, profile?.fullName || user.email);
  };

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

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[450px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-600 to-brand-500 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🛡️</div>
              <div>
                <p className="text-white font-bold text-sm">SkillBridge Support</p>
                <p className="text-brand-100 text-[10px]">Active now</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <p className="text-slate-400 text-sm"> 👋 Hello! How can we help you today?</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-500 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    <p>{msg.text}</p>
                    {msg.timestamp && (
                      <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-brand-100' : 'text-slate-500'}`}>
                        {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-slate-800/50 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white p-2 rounded-xl transition-all shadow-lg shadow-brand-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Bubble */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="w-14 h-14 bg-brand-500 hover:bg-brand-400 text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-500/30 transition-all hover:scale-110 active:scale-95 animate-bounce-slow"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
