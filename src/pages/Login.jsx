import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [desiredRole, setDesiredRole] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, fullName, college, desiredRole);
        if (error) throw error;
      }
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { width: '0%', color: 'bg-gray-200' };
    if (pass.length < 6) return { width: '33%', color: 'bg-red-500' };
    if (pass.length < 10) return { width: '66%', color: 'bg-yellow-500' };
    return { width: '100%', color: 'bg-green-500' };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow flex pt-16">
        {/* Left Decorative Column */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-brand-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-indigo-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] mix-blend-overlay opacity-20"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 lg:px-24">
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Accelerate your Career Journey
            </h2>
            <p className="text-brand-100 text-lg mb-12 max-w-md">
              Join thousands of professionals securing their dream jobs daily. SkillBridge analyses your resume against real-time market needs.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-300">✓</div>
                <span className="text-white font-medium">Smart AI Analysis</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-300">✓</div>
                <span className="text-white font-medium">Live Job Matches</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-300">✓</div>
                <span className="text-white font-medium">Automated Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-sm text-gray-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field py-2.5 px-3" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">College / University</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field py-2.5 px-3" 
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Desired Role</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Frontend Dev"
                        className="input-field py-2.5 px-3" 
                        value={desiredRole}
                        onChange={(e) => setDesiredRole(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input 
                  type="email" 
                  required 
                  className="input-field py-2.5 px-3" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="input-field py-2.5 px-3 pr-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-brand-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {!isLogin && password && (
                  <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrength(password).color}`} 
                      style={{ width: getPasswordStrength(password).width }}
                    ></div>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-brand-600 hover:text-brand-500">Forgot password?</a>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full btn-primary py-3 text-base shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
