import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
              🌉 SkillBridge
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Dashboard</Link>
                <Link to="/profile" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Profile</Link>
                <Link to="/jobs" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Jobs</Link>
                <Link to="/upload" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Upload</Link>
                <Link to="/email-alerts" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Alerts</Link>
                
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border border-brand-200">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={signOut} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Sign In</Link>
                <Link to="/login" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
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
        <div className="sm:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600">Dashboard</Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600">Profile</Link>
                <Link to="/jobs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600">Jobs</Link>
                <Link to="/upload" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600">Upload</Link>
                <Link to="/email-alerts" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600">Alerts</Link>
                <button onClick={signOut} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600">Sign In</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
