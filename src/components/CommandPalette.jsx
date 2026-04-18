import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ROUTES = [
  { id: 'home', title: 'Home', path: '/', icon: '🏠', keywords: ['home', 'landing'] },
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', icon: '📊', keywords: ['dashboard', 'home', 'overview'] },
  { id: 'upload', title: 'Upload Resume', path: '/upload', icon: '📄', keywords: ['upload', 'resume', 'cv', 'new'] },
  { id: 'profile', title: 'Skill Profile', path: '/profile', icon: '👤', keywords: ['profile', 'skills', 'ats', 'score'] },
  { id: 'jobs', title: 'Job Matches', path: '/jobs', icon: '💼', keywords: ['jobs', 'matches', 'find', 'search'] },
  { id: 'tracker', title: 'Application Tracker', path: '/tracker', icon: '📌', keywords: ['tracker', 'applications', 'kanban', 'board'] },
  { id: 'roadmap', title: 'Career Roadmap', path: '/roadmap', icon: '🗺️', keywords: ['roadmap', 'path', 'learning', 'courses'] },
  { id: 'interview', title: 'Interview Simulator', path: '/jobs', icon: '🤖', keywords: ['interview', 'simulator', 'mock', 'ai'] },
  { id: 'analytics', title: 'Analytics', path: '/analytics', icon: '📈', keywords: ['analytics', 'charts', 'data', 'progress'] },
  { id: 'smartsearch', title: 'Smart Job Search', path: '/smart-search', icon: '🔍', keywords: ['search', 'smart', 'find'] },
  { id: 'alerts', title: 'Email Alerts', path: '/alerts', icon: '🔔', keywords: ['alerts', 'email', 'notifications'] },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRoutes = ROUTES.filter((route) => {
    if (!query) return true;
    const searchString = query.toLowerCase();
    return (
      route.title.toLowerCase().includes(searchString) ||
      route.keywords.some((k) => k.includes(searchString))
    );
  });

  const handleSelect = (route) => {
    setIsOpen(false);
    navigate(route.path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredRoutes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
    } else if (e.key === 'Enter' && filteredRoutes.length > 0) {
      e.preventDefault();
      handleSelect(filteredRoutes[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div 
        className="relative w-full max-w-2xl bg-dark-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        style={{ animationDuration: '0.2s' }}
      >
        <div className="flex items-center px-4 border-b border-white/5">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-white text-lg placeholder-gray-500 focus:ring-0 py-5 outline-none"
            placeholder="Search pages, tools, or actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
            <span>ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          {filteredRoutes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            filteredRoutes.map((route, index) => (
              <button
                key={route.id}
                onClick={() => handleSelect(route)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                  index === selectedIndex
                    ? 'bg-brand-500/10 border-brand-500/30'
                    : 'hover:bg-white/5 border-transparent'
                } border`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{route.icon}</span>
                  <span className={`font-bold ${index === selectedIndex ? 'text-brand-400' : 'text-gray-300'}`}>
                    {route.title}
                  </span>
                </div>
                <div className={`text-[10px] uppercase tracking-widest font-black ${index === selectedIndex ? 'text-brand-500' : 'text-gray-600'}`}>
                  Jump to
                </div>
              </button>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-white/[0.02] border-t border-white/5 px-4 py-3 flex items-center gap-4 text-[10px] font-bold text-gray-500">
          <div className="flex items-center gap-1.5">
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↑</kbd>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↵</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
