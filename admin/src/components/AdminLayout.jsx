import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../auth/AdminAuthContext';
import AdminAssistant from './AdminAssistant';

export default function AdminLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false);
  const { admin } = useAdminAuth();
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-admin-bg overflow-hidden">
      {/* Sidebar */}
      <div className="relative flex-shrink-0 z-20">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-admin-border bg-admin-card/50 backdrop-blur-sm flex-shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-none">{title}</h1>
            {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:block">{now}</span>

            {/* Status pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-slow" />
              <span className="text-green-400 text-xs font-medium">Live</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
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
