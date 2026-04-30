import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function ExtensionSync({ userSkills }) {
  const { profile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState('');

  const handleSync = () => {
    if (!userSkills) return;
    
    setSyncing(true);
    setStatus('Preparing sync data...');

    // Prepare the payload for the extension
    const syncData = {
      type: 'SKILLBRIDGE_SYNC',
      payload: {
        name: profile?.fullName || 'User',
        email: profile?.email,
        skills: userSkills.skills,
        atsScore: userSkills.atsScore,
        groqKey: import.meta.env.VITE_GROQ_API_KEY, // Syncing the key so the extension can use it
        syncedAt: new Date().toISOString()
      }
    };

    // Emit a custom event that the content script can listen to
    const event = new CustomEvent('SkillBridgeSyncEvent', { detail: syncData });
    window.dispatchEvent(event);

    setTimeout(() => {
      setSyncing(false);
      setStatus('✅ Profile pushed to extension! Check your extension popup.');
      setTimeout(() => setStatus(''), 5000);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-brand-900/20 border border-brand-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all duration-700" />
      
      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-neon-blue">
          🪄
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-black text-white mb-1 tracking-tight">Magic Fill Extension</h3>
          <p className="text-slate-400 text-sm font-medium">Sync your skills to auto-fill applications on LinkedIn & Indeed.</p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2">
          <button
            onClick={handleSync}
            disabled={syncing || !userSkills}
            className={`px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-lg ${
              syncing 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-brand-500 hover:bg-brand-400 text-white shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5'
            }`}
          >
            {syncing ? 'Syncing...' : 'Sync Profile Now'}
          </button>
          {status && <p className="text-[10px] font-bold text-brand-400 animate-pulse uppercase tracking-widest">{status}</p>}
        </div>
      </div>
    </div>
  );
}
