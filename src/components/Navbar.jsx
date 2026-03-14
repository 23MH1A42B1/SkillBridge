import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();

  const account = instance.getActiveAccount() || accounts[0];
  const userName = account?.name || account?.username || 'User';
  const userEmail = account?.username || 'user@skillbridge.ai';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/upload', label: 'Upload Resume' },
  ];

  async function handleLogout() {
    await instance.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:3000',
    });
    navigate('/login');
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-base font-bold text-white transition-all duration-200 hover:text-blue-300">
          SB SkillBridge
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors duration-200 ${
                  active ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
              {userName.charAt(0)}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-200">{userName}</div>
              <div className="max-w-44 truncate text-[11px] text-slate-400">{userEmail}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 transition-all duration-200 hover:bg-red-900/20 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
