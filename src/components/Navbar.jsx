import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useState } from 'react';
import VoiceNavigator from './VoiceNavigator';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-dark-bg/80 backdrop-blur-xl border-b border-white/5 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
              <img src="/favicon.png" alt="" className="h-8 w-8 object-contain transition-transform group-hover:scale-110" />
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-400 tracking-tighter">
                SKILLBRIDGE
              </span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Dashboard</Link>
                <Link to="/resumes" className="text-brand-400 hover:text-brand-300 font-black text-[10px] uppercase tracking-[0.2em] transition-colors border border-brand-500/20 px-3 py-1.5 rounded-lg bg-brand-500/5">Portfolio</Link>
                <Link to="/profile" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Profile</Link>
                <Link to="/smart-search" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Smart Search</Link>
                <Link to="/jobs" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Jobs</Link>
                <Link to="/negotiator" className="text-amber-400 hover:text-amber-300 font-black text-[10px] uppercase tracking-[0.2em] transition-colors border border-amber-500/20 px-3 py-1.5 rounded-lg bg-amber-500/5">Negotiate</Link>
                <Link to="/tracker" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Tracker</Link>
                <Link to="/analytics" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Analytics</Link>
                <Link to="/upload" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Upload</Link>
                
                <div className="flex items-center space-x-6 pl-6 border-l border-white/10">
                  <VoiceNavigator />
                  <div className="h-9 w-9 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 font-black border border-brand-500/30">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={signOut} className="text-xs font-black text-gray-500 hover:text-red-400 uppercase tracking-widest transition-colors">
                    Logout
                  </button>
                </div>
              </>

            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest">Sign In</Link>
                <Link to="/login" className="btn-primary px-6 py-2.5 rounded-full">Get Started</Link>
              </>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-dark-card border-b border-white/5 animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Dashboard</Link>
                <Link to="/resumes" className="block px-3 py-3 rounded-xl text-sm font-bold text-brand-400 hover:bg-brand-500/5">Portfolio</Link>
                <Link to="/profile" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Profile</Link>
                <Link to="/smart-search" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Smart Search</Link>
                <Link to="/jobs" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Jobs</Link>
                <Link to="/negotiator" className="block px-3 py-3 rounded-xl text-sm font-bold text-amber-400 hover:bg-amber-500/5">Negotiate</Link>
                <Link to="/tracker" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Tracker</Link>
                <Link to="/analytics" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Analytics</Link>
                <Link to="/upload" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Upload</Link>
                <button onClick={signOut} className="block w-full text-left px-3 py-3 rounded-xl text-sm font-bold text-red-400/70 hover:bg-red-500/5">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white">Sign In</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
