import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext';

export default function AdminLogin() {
  const { login, authError, setAuthError, loading } = useAdminAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]         = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setBusy(true);
    const ok = await login(email, password);
    setBusy(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/15 border border-brand-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 glow-blue">
            🛡️
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Admin Portal</h1>
          <p className="text-slate-400 text-sm">SkillBridge Platform Administration</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-3 mb-6">
            <span className="text-brand-400">🔐</span>
            <p className="text-brand-300 text-xs">Admin credentials required. Regular user accounts cannot access this portal.</p>
          </div>

          {authError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 animate-fade-in">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <p className="text-red-300 text-sm">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@skillbridge.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                id="admin-email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  id="admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              id="admin-login-btn"
            >
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>🛡️ Access Admin Portal</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-admin-border text-center">
            <p className="text-slate-500 text-xs">
              Need to set up admin access?{' '}
              <span className="text-brand-400">Create your account in Firebase Console → Authentication, then update <code className="text-purple-400">VITE_ADMIN_EMAIL</code> in admin/.env</span>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="http://localhost:5173"
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            ← Back to SkillBridge App
          </a>
        </div>
      </div>
    </div>
  );
}
