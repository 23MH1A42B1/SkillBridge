import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../auth/AdminAuthContext';
import AdminAssistant from './AdminAssistant';

export default function AdminLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { admin } = useAdminAuth();
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-admin-bg overflow-hidden relative">
      {/* Sidebar - Desktop (Static) */}
      <div className="hidden lg:flex flex-shrink-0 z-20">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Sidebar - Mobile (Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out z-50 flex-shrink-0 lg:hidden
      `}>
        <AdminSidebar collapsed={false} onToggle={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-admin-border bg-admin-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-admin-hover border border-admin-border text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg leading-none truncate">{title}</h1>
              {subtitle && <p className="text-slate-500 text-[10px] sm:text-xs mt-1 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-[10px] sm:text-xs text-slate-500 hidden md:block">{now}</span>

            {/* Status pill */}
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-slow" />
              <span className="text-green-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Live</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              {admin?.email?.[0].toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      
      {/* Global Floating AI Assistant */}
      <AdminAssistant />
    </div>
  );
}
