import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { users, login, loginAsAdmin } = useApp();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    if (isAdmin) {
      loginAsAdmin();
      navigate('/admin');
    } else if (selectedUser) {
      login(selectedUser, 'candidate');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-2">
        <div className="hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-blue-900/60 to-violet-900/60 p-8 shadow-lg shadow-black/20 lg:block">
          <h2 className="text-3xl font-bold">Smart Placement, Reimagined</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            SkillBridge helps candidates and placement teams connect resumes, live jobs, and AI matching in one intelligent workflow.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs">✓</span>
              <span className="text-slate-200">Resume parsing with ATS score and skill-gap insights</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs">✓</span>
              <span className="text-slate-200">Live job scraping from top Indian hiring portals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs">✓</span>
              <span className="text-slate-200">Weighted match scoring with instant recommendations</span>
            </li>
          </ul>
        </div>

        <div className="w-full max-w-md justify-self-center rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl shadow-black/30">
          <div className="mb-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <svg viewBox="0 0 21 21" width="24" height="24">
                <rect x="0" y="0" width="10" height="10" fill="#f25022" />
                <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
                <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
                <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Sign in to SkillBridge</h1>
            <p className="mt-1 text-sm text-slate-400">Microsoft Entra ID - Single Sign-On</p>
          </div>

          <div className="mb-5 flex gap-1 rounded-xl bg-slate-900 p-1">
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                !isAdmin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setIsAdmin(false)}
            >
              Candidate
            </button>
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isAdmin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setIsAdmin(true)}
            >
              Admin
            </button>
          </div>

          {!isAdmin ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Select your account</label>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {users.map(u => (
                  <button
                    key={u.UserID}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                      selectedUser === u.UserID
                        ? 'rounded-xl border border-blue-600 bg-blue-900/40'
                        : 'hover:bg-slate-700'
                    }`}
                    onClick={() => setSelectedUser(u.UserID)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white">
                      {u.Name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{u.Name}</span>
                      <span className="block truncate text-xs text-slate-400">{u.Email}</span>
                    </div>
                    <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">{u.College}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900 p-6 text-center">
              <div className="mb-3 text-5xl">🛡️</div>
              <p className="text-sm text-slate-200">Sign in as <strong>Placement Admin</strong></p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Full access to admin dashboard, user management, scraper controls, and Power BI analytics.
              </p>
            </div>
          )}

          <button
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleLogin}
            disabled={!isAdmin && !selectedUser}
          >
            Sign in with Microsoft
          </button>

          <div className="mt-4">
            <p className="text-center text-xs text-slate-400">
              Protected by Microsoft Entra ID. Role-based access control enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
