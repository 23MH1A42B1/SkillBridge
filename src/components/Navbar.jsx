import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();

  const account = instance.getActiveAccount() || accounts[0];
  const userName = account?.name || account?.username || 'User';

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
    <header className="border-b border-slate-700 bg-slate-800/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-xl font-semibold text-white">
          SkillBridge
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition ${
                  active ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-200 sm:inline">{userName}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
