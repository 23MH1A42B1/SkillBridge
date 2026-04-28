import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext';

const NAV = [
  { to: '/dashboard',   icon: '📊', label: 'Dashboard' },
  { to: '/users',       icon: '👥', label: 'Users' },
  { to: '/resumes',     icon: '📄', label: 'Resumes' },
  { to: '/analytics',   icon: '📈', label: 'Analytics' },
  { to: '/interviews',  icon: '🎤', label: 'Interviews' },
  { to: '/emails',      icon: '📧', label: 'Email Alerts' },
  { to: '/config',      icon: '⚙️', label: 'System Config' },
  { to: '/support',     icon: '💬', label: 'User Support' },
  { to: '/employers',   icon: '🏢', label: 'Employers' },
  { to: '/audit',       icon: '🔍', label: 'Audit Log' },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`flex flex-col h-full bg-admin-card border-r border-admin-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-admin-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-lg flex-shrink-0">
          🛡️
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-none">SkillBridge</p>
            <p className="text-brand-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-admin-card border border-admin-border rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/40 transition-all z-10"
        style={{ position: 'relative', marginTop: '-0.5rem', marginLeft: collapsed ? 'calc(100% - 12px)' : 'calc(100% - 12px)' }}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {!collapsed && <p className="section-label px-3 py-2 mt-2">Navigation</p>}
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive
                ? 'bg-brand-500/15 text-white border border-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-admin-hover'}
               ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : ''}
          >
            <span className="text-base flex-shrink-0">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Admin user footer */}
      <div className={`p-3 border-t border-admin-border ${collapsed ? 'items-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{admin?.name || 'Admin'}</p>
              <p className="text-slate-500 text-[10px] truncate">{admin?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 
                      hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : ''}
        >
          <span className="text-base">🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
