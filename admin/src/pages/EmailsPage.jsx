import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllUsers, getStats, pushLiveAnnouncement } from '../services/adminService';
import { generateEmailDraft } from '../services/aiService';
import { useAdminAuth } from '../auth/AdminAuthContext';

export default function EmailsPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast]     = useState('');
  
  const [aiTopic, setAiTopic] = useState('');
  const [drafting, setDrafting] = useState(false);

  const { admin } = useAdminAuth();
  const [liveMessage, setLiveMessage] = useState('');
  const [liveType, setLiveType] = useState('info');
  const [pushingLive, setPushingLive] = useState(false);

  useEffect(() => {
    getAllUsers().then(u => setUsers(u.filter(u => u.emailAlerts !== false))).catch(console.error).finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleBroadcast = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    // In production: call your Azure Function or email service
    setSending(false);
    showToast(`Broadcast queued for ${users.length} users! (Connect to your email service to send)`);
    setSubject('');
    setMessage('');
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setDrafting(true);
    try {
      const stats = await getStats();
      const draft = await generateEmailDraft(aiTopic, stats);
      setMessage(draft);
      if (!subject) setSubject('SkillBridge Platform Update');
      showToast('✨ AI drafted your email successfully!');
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally {
      setDrafting(false);
    }
  };

  const handlePushLive = async () => {
    if (!liveMessage.trim()) return;
    setPushingLive(true);
    try {
      await pushLiveAnnouncement(admin.email, liveMessage, liveType);
      showToast('🚀 Live announcement pushed to all users!');
      setLiveMessage('');
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally {
      setPushingLive(false);
    }
  };

  const subscribedUsers = users.filter(u => u.emailAlerts !== false);

  if (loading) return (
    <AdminLayout title="Email Alerts" subtitle="Manage notifications">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Email & Notifications" subtitle="Manage email alerts and broadcast messages">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in shadow-lg max-w-sm">
          ✓ {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Composer */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center text-lg">📢</div>
            <div>
              <p className="text-white font-semibold">Send Broadcast</p>
              <p className="text-slate-500 text-xs">Message all users with email alerts enabled</p>
            </div>
          </div>

          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <span className="text-brand-400">📬</span>
            <p className="text-brand-300 text-xs">{subscribedUsers.length} users will receive this message</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="section-label mb-1.5 block">Subject</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. New features available in SkillBridge!"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                id="broadcast-subject"
              />
            </div>
            
            {/* AI Drafter */}
            <div className="bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border border-brand-500/20 rounded-xl p-4 my-2">
              <label className="text-brand-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>✨</span> AI Email Drafter
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field py-2 text-xs flex-1"
                  placeholder="e.g. Announce the new Interview Simulator"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                />
                <button
                  onClick={handleGenerateAI}
                  disabled={drafting || !aiTopic.trim()}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {drafting ? 'Generating...' : 'Generate ✨'}
                </button>
              </div>
            </div>

            <div>
              <label className="section-label mb-1.5 block">Message</label>
              <textarea
                className="input-field resize-none"
                rows={6}
                placeholder="Write your broadcast message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                id="broadcast-message"
              />
            </div>
            <button
              onClick={handleBroadcast}
              disabled={sending || !subject.trim() || !message.trim()}
              className="btn-primary w-full justify-center py-3"
              id="send-broadcast-btn"
            >
              {sending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              ) : (
                '📤 Send to All Users'
              )}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-admin-border">
            <p className="text-slate-500 text-xs">
              💡 To enable real sending, connect to your email service (SendGrid, AWS SES, or the existing <code className="text-purple-400">emailService.js</code>) via an Azure Function endpoint.
            </p>
          </div>
        </div>
        
        {/* Live Announcements */}
        <div className="glass-card p-6 col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center text-lg animate-pulse-slow">🚀</div>
              <div>
                <p className="text-white font-bold text-lg">Live Push Notification</p>
                <p className="text-indigo-300 text-xs font-medium">Instantly pop up a toast message on every active user's screen</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
            <div className="flex-1 w-full">
              <label className="text-indigo-300 text-xs font-semibold mb-1.5 block">Message</label>
              <input
                type="text"
                className="input-field border-indigo-500/30 focus:border-indigo-500"
                placeholder="e.g. System going down for maintenance in 5 mins!"
                value={liveMessage}
                onChange={e => setLiveMessage(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="text-indigo-300 text-xs font-semibold mb-1.5 block">Type</label>
              <select 
                className="input-field border-indigo-500/30 focus:border-indigo-500 bg-admin-card"
                value={liveType}
                onChange={e => setLiveType(e.target.value)}
              >
                <option value="info">ℹ️ Info (Blue)</option>
                <option value="success">✅ Success (Green)</option>
                <option value="error">⚠️ Alert (Red)</option>
              </select>
            </div>
            <button
              onClick={handlePushLive}
              disabled={pushingLive || !liveMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 w-full md:w-auto"
            >
              {pushingLive ? 'Pushing...' : '🚀 Push Live Alert'}
            </button>
          </div>
        </div>

        {/* Subscriber list */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-green-500/15 rounded-xl flex items-center justify-center text-lg">📋</div>
            <div>
              <p className="text-white font-semibold">Subscribers</p>
              <p className="text-slate-500 text-xs">{subscribedUsers.length} users with alerts enabled</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {users.map(u => (
              <div key={u.uid || u.id} className="flex items-center justify-between p-3 bg-admin-hover rounded-xl border border-admin-border hover:border-brand-500/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0">
                    {(u.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{u.fullName || u.displayName || 'Unknown'}</p>
                    <p className="text-slate-500 text-[10px]">{u.email}</p>
                  </div>
                </div>
                <span className={`badge ${u.emailAlerts === false ? 'badge-red' : 'badge-green'}`}>
                  {u.emailAlerts === false ? 'Off' : 'On'}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">No users registered yet</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
