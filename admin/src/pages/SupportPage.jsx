import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { subscribeToChats, subscribeToChatMessages, sendAdminMessage, closeChat, deleteMessage } from '../services/supportService';
import { useAdminAuth } from '../auth/AdminAuthContext';

export default function SupportPage() {
  const { admin } = useAdminAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToChats((updatedChats) => {
      setChats(updatedChats);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const unsubscribe = subscribeToChatMessages(selectedChat.id, (msgs) => {
        setMessages(msgs);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
      return unsubscribe;
    }
  }, [selectedChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;

    setLoading(true);
    try {
      await sendAdminMessage(selectedChat.id, inputText, admin.name || 'Admin');
      setInputText('');
    } catch (error) {
      console.error("Failed to send admin message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseChat = async () => {
    if (!selectedChat) return;
    await closeChat(selectedChat.id);
  };
  const handleDeleteMessage = async (messageId) => {
    if (!selectedChat || !window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteMessage(selectedChat.id, messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Check console for details.");
    }
  };


  return (
    <AdminLayout title="User Support" subtitle="Real-time assistance for platform users">
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Chat List */}
        <div className="w-80 glass-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-admin-border bg-admin-hover/50">
            <h2 className="text-white font-semibold">Active Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chats.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm italic">No active support tickets</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-4 border-b border-admin-border text-left transition-all hover:bg-admin-hover flex items-start gap-3 ${
                    selectedChat?.id === chat.id ? 'bg-brand-500/10 border-l-4 border-l-brand-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold flex-shrink-0">
                    {chat.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-sm font-semibold truncate">{chat.userName}</p>
                      {chat.unreadCount > 0 && (
                        <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{chat.lastMessage || 'Starting conversation...'}</p>
                    <p className="text-slate-600 text-[10px] mt-1 italic">
                      {chat.updatedAt ? new Date(chat.updatedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 glass-card flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-admin-border flex items-center justify-between bg-admin-hover/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                    {selectedChat.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{selectedChat.userName}</h3>
                    <p className="text-brand-400 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                      Support Ticket: {selectedChat.id.slice(-8)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="btn-secondary text-xs px-3 py-1.5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                >
                  Close Ticket
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-admin-bg/30 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex group relative ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm relative ${
                      msg.role === 'admin'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-admin-card border border-admin-border text-slate-200 rounded-tl-none'
                    }`}>
                      {/* Delete Button - Always visible for Admin */}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className={`absolute top-2 ${msg.role === 'admin' ? '-left-10' : '-right-10'} p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors`}
                        title="Delete message"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center gap-2 mt-2 ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] font-medium ${msg.role === 'admin' ? 'text-brand-200' : 'text-slate-500'}`}>
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] opacity-40">•</span>
                        <span className={`text-[10px] ${msg.role === 'admin' ? 'text-brand-200' : 'text-slate-500'}`}>
                          {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 bg-admin-card border-t border-admin-border flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Reply to ${selectedChat.userName}...`}
                  className="flex-1 bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
                >
                  {loading ? '...' : 'Send Message'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-4xl mb-6 grayscale opacity-50 animate-pulse">
                💬
              </div>
              <h3 className="text-white text-xl font-bold mb-2">No conversation selected</h3>
              <p className="text-slate-500 max-w-sm">Select a user from the list on the left to start assisting them in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
