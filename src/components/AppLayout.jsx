import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useSystem } from '../context/SystemContext';
import ScrollProgress from './ScrollProgress';
import PageWrapper from './PageWrapper';
import GlobalAssistant from './GlobalAssistant';
import SupportWidget from './SupportWidget';

/* ── Nav items ──────────────────────────────────────────────────── */
const NAV_CORE = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/jobs',
    label: 'Jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/smart-search',
    label: 'Smart Search',
    featureKey: 'smartSearch',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    to: '/tracker',
    label: 'Tracker',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const NAV_TOOLS = [
  {
    to: '/resumes',
    label: 'Portfolio',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    to: '/upload',
    label: 'Upload Resume',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    to: '/email-alerts',
    label: 'Email Alerts',
    featureKey: 'emailAlerts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    to: '/support',
    label: 'Support Chat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

/* ── Mobile bottom nav items (5 key links) ──────────────────────── */
const MOBILE_NAV = [
  NAV_CORE[0], // Dashboard
  NAV_CORE[1], // Jobs
  NAV_CORE[2], // Smart Search
  NAV_CORE[3], // Tracker
  NAV_TOOLS[1], // Profile
];

/* ── NavLink helper ─────────────────────────────────────────────── */
function NavItem({ to, label, icon, collapsed, onClick }) {
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
    >
      <span className="sidebar-link-icon">{icon}</span>
      {!collapsed && <span className="sidebar-link-label">{label}</span>}
    </Link>
  );
}

/* ── Mobile Tab Bar (needs its own component to use hooks) ──────── */
function MobileTabBar({ navItems }) {
  const { pathname } = useLocation();
  return (
    <nav className="mobile-tab-bar" aria-label="Mobile navigation">
      {navItems.map(item => {
        const isActive = pathname === item.to || (item.to !== '/dashboard' && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`mobile-tab-item ${isActive ? 'mobile-tab-active' : 'mobile-tab-inactive'}`}
            title={item.label}
          >
            {item.icon}
            <span className="mobile-tab-label">{item.label.split(' ')[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ── AppLayout ──────────────────────────────────────────────────── */
export default function AppLayout({ children }) {
  const { user, profile, signOut, isImpersonated, endImpersonation } = useAuth();
  const { config, loading } = useSystem();
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_sidebar_collapsed')) ?? false; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sb_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const avatarChar = profile?.fullName
    ? profile.fullName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?';

  const isFeatureEnabled = (key) => !key || config?.features?.[key] !== false;
  
  const filteredNavCore = NAV_CORE.filter(item => isFeatureEnabled(item.featureKey));
  const filteredNavTools = NAV_TOOLS.filter(item => isFeatureEnabled(item.featureKey));
  const filteredMobileNav = MOBILE_NAV.filter(item => isFeatureEnabled(item.featureKey));

  return (
    <div className="app-shell flex flex-col min-h-screen">
      {isImpersonated && (
        <div className="bg-purple-600/95 backdrop-blur-md text-white py-2 px-4 font-semibold text-sm z-[100] shadow-lg flex items-center justify-between flex-shrink-0 border-b border-purple-500">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">👀</span>
            <span>You are currently impersonating <span className="underline decoration-purple-300">{profile?.fullName || user?.email || 'a user'}</span>.</span>
          </div>
          <button 
            onClick={endImpersonation}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors text-xs border border-white/30 shadow-sm"
          >
            End Impersonation ✕
          </button>
        </div>
      )}
      {config?.maintenance?.enabled && (
        <div className="bg-orange-500/90 backdrop-blur-md text-white text-center py-2.5 px-4 font-semibold text-sm z-[100] shadow-md flex items-center justify-center gap-2 flex-shrink-0 animate-slide-in">
          ⚠️ {config.maintenance.message || "SkillBridge is currently under maintenance. Some features may be unavailable."}
        </div>
      )}
      <div className="flex-1 flex relative">
        <ScrollProgress />
        <GlobalAssistant />

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <Link to="/dashboard" className="sidebar-logo-link">
            <img src="/favicon.png" alt="SkillBridge" className="sidebar-logo-img" />
            {!collapsed && (
              <span className="sidebar-logo-text">SKILLBRIDGE</span>
            )}
          </Link>
          <button
            id="sidebar-toggle-btn"
            onClick={() => setCollapsed(c => !c)}
            className="sidebar-toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Nav sections */}
        <nav className="sidebar-nav">
          {!collapsed && (
            <p className="sidebar-section-label">Core</p>
          )}
          {filteredNavCore.map(item => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}

          <div className="sidebar-divider" />

          {!collapsed && (
            <p className="sidebar-section-label">Tools</p>
          )}
          {filteredNavTools.map(item => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className={`sidebar-user ${collapsed ? 'sidebar-user-collapsed' : ''}`}>
            <div className="sidebar-avatar" title={profile?.fullName || user?.email}>
              {avatarChar}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{profile?.fullName || 'User'}</p>
                <p className="sidebar-user-email">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={signOut}
            title="Logout"
            className={`sidebar-logout ${collapsed ? 'sidebar-logout-collapsed' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className={`app-main ${collapsed ? 'app-main-collapsed' : 'app-main-expanded'}`}>
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            className="mobile-menu-btn"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="mobile-brand">
            <img src="/favicon.png" alt="" className="h-7 w-7 object-contain" />
            <span className="mobile-brand-text">SKILLBRIDGE</span>
          </Link>
          <div className="mobile-avatar">{avatarChar}</div>
        </div>

        {/* Mobile slide-down menu overlay */}
        {mobileOpen && (
          <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
            <div className="mobile-menu" onClick={e => e.stopPropagation()}>
              {[...filteredNavCore, ...filteredNavTools].map(item => (
                <NavItem key={item.to} {...item} collapsed={false} onClick={() => setMobileOpen(false)} />
              ))}
              <div className="sidebar-divider" />
              <button onClick={signOut} className="mobile-logout-btn">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="app-content">
          <PageWrapper>
            {children}
          </PageWrapper>
        </div>
      </main>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <MobileTabBar navItems={filteredMobileNav} />
      </div>
    </div>
  );
}
