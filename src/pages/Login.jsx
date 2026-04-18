import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/* ─── Floating particle config ─────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 8,
  duration: Math.random() * 12 + 10,
  opacity: Math.random() * 0.35 + 0.05,
}));

/* ─── SVG icons ─────────────────────────────────────────────────────────── */
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconMail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconBuilding = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconBriefcase = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconEye = ({ open }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    )}
  </svg>
);

/* ─── Password strength bar ─────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  const getLevel = (p) => {
    if (!p) return 0;
    if (p.length < 6) return 1;
    if (p.length < 10) return 2;
    return 3;
  };
  const level = getLevel(password);
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#22c55e'];
  if (!password) return null;
  return (
    <div className="mt-2 flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-1 flex-1 rounded-full transition-all duration-500"
          style={{ background: level >= n ? colors[level] : '#1f1f2e' }} />
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: colors[level] }}>
        {labels[level]}
      </span>
    </div>
  );
}

/* ─── Feature badge ──────────────────────────────────────────────────────── */
function FeatureBadge({ icon, text }) {
  return (
    <div className="flex items-center gap-2.5 text-white/70 text-sm">
      <span className="text-violet-300">{icon}</span>
      {text}
    </div>
  );
}

/* ─── Inline styles (no extra CSS file needed) ──────────────────────────── */
const styles = `
  @keyframes loginFadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes loginFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-18px) rotate(3deg); }
    66%       { transform: translateY(-8px) rotate(-2deg); }
  }
  @keyframes loginOrbit {
    from { transform: rotate(0deg) translateX(260px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(260px) rotate(-360deg); }
  }
  @keyframes loginPulseRing {
    0%   { transform: scale(0.9); opacity: 0.7; }
    70%  { transform: scale(1.3); opacity: 0; }
    100% { transform: scale(1.3); opacity: 0; }
  }
  @keyframes loginGradShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes loginShake {
    0%,100%{ transform:translateX(0); }
    20%    { transform:translateX(-8px); }
    40%    { transform:translateX(8px); }
    60%    { transform:translateX(-5px); }
    80%    { transform:translateX(5px); }
  }
  .login-fade-up  { animation: loginFadeUp 0.6s ease-out both; }
  .login-float    { animation: loginFloat var(--dur, 14s) ease-in-out var(--delay, 0s) infinite; }
  .login-orbit    { animation: loginOrbit 18s linear infinite; }
  .login-pulse-ring { animation: loginPulseRing 2.2s ease-out infinite; }
  .login-grad-btn {
    background: linear-gradient(135deg, #0d9488, #6366f1, #14b8a6, #0d9488);
    background-size: 300% 300%;
    animation: loginGradShift 4s ease infinite;
  }
  .login-grad-btn:hover {
    box-shadow: 0 0 28px rgba(13,148,136,0.65), 0 0 60px rgba(99,102,241,0.25);
    transform: translateY(-2px) scale(1.02);
  }
  .login-grad-btn:active { transform: translateY(0) scale(0.98); }
  .login-shake { animation: loginShake 0.5s ease; }
  .login-input-group input:focus ~ .login-underline,
  .login-input-group input:not(:placeholder-shown) ~ .login-underline {
    transform: scaleX(1);
  }
  .login-underline {
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  .login-tab { transition: all 0.3s ease; }
  .login-tab.active {
    color: white;
    border-bottom: 2px solid #8b5cf6;
  }
  .login-glass {
    background: rgba(6, 13, 24, 0.88);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(13, 148, 136, 0.22);
  }
  .login-left-glass {
    background: linear-gradient(145deg, rgba(13, 148, 136, 0.22), rgba(79, 70, 229, 0.15));
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-right: 1px solid rgba(20, 184, 166, 0.18);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
function TypewriterHeading({ isLogin }) {
  const text1 = isLogin ? "Your Career" : "Start Your";
  const text2 = isLogin ? "Awaits." : "Journey.";
  const [displayed1, setDisplayed1] = useState('');
  const [displayed2, setDisplayed2] = useState('');

  useEffect(() => {
    setDisplayed1('');
    setDisplayed2('');
    let i = 0;
    let j = 0;
    const interval = setInterval(() => {
      if (i <= text1.length) {
        setDisplayed1(text1.substring(0, i));
        i++;
      } else if (j <= text2.length) {
        setDisplayed2(text2.substring(0, j));
        j++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isLogin, text1, text2]);

  return (
    <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter">
      {displayed1}<br />
      <span style={{ background: 'linear-gradient(90deg,#2dd4bf,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {displayed2}
      </span>
      <span className="animate-pulse font-light text-brand-400">|</span>
    </h1>
  );
}
export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [desiredRole, setDesiredRole] = useState('');
  
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const switchMode = (val) => {
    setIsLogin(val);
    setErrorMsg('');
    setEmail(''); setPassword(''); setFullName(''); setCollege(''); setDesiredRole('');
  };

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
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
      setShakeKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Inject keyframes */}
      <style>{styles}</style>

      {/* ── Full-screen animated BG ────────────────────────── */}
      <div className="fixed inset-0 -z-10" style={{
        background: 'linear-gradient(135deg, #030810 0%, #050d1a 40%, #080d20 70%, #030810 100%)',
      }}>
        {/* Large glow blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full opacity-12"
          style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)', filter: 'blur(60px)' }} />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <div key={p.id} className="absolute rounded-full login-float pointer-events-none"
            style={{
              width: p.size, height: p.size,
              left: `${p.x}%`, top: `${p.y}%`,
              background: `rgba(${p.id % 2 === 0 ? '20,184,166' : '99,102,241'},${p.opacity})`,
              '--dur': `${p.duration}s`,
              '--delay': `${p.delay}s`,
            }}
          />
        ))}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* ── Main card ─────────────────────────────────────── */}
      <div 
        className="min-h-screen flex items-center justify-center p-4 font-sans perspective-1000"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const tiltX = (y - cy) / cy * -3; 
          const tiltY = (x - cx) / cx * 3;
          setTiltStyle({
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transition: 'transform 0.1s ease-out'
          });
        }}
        onMouseLeave={() => {
          setTiltStyle({
            transform: 'rotateX(0deg) rotateY(0deg)',
            transition: 'transform 0.5s ease-out'
          });
        }}
      >
        <div
          className={`w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl login-glass
            ${mounted ? 'login-fade-up' : 'opacity-0'}`}
          style={{ 
            boxShadow: '0 0 60px rgba(13,148,136,0.18), 0 25px 60px rgba(0,0,0,0.6)',
            ...tiltStyle
          }}
        >
          {/* ── LEFT PANEL ─────────────────────────────────── */}
          <div className="lg:w-[44%] p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden login-left-glass">
            {/* Decorative ring */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full"
              style={{ border: '1px solid rgba(20,184,166,0.15)' }} />
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full"
              style={{ border: '1px solid rgba(20,184,166,0.1)' }} />

            {/* Logo / brand */}
            <div className="relative z-10">
              <Link to="/" className="flex items-center gap-2 mb-10 group/logo transition-all hover:opacity-80">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)' }}>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-xl login-pulse-ring"
                    style={{ border: '2px solid rgba(20,184,166,0.6)' }} />
                  <img src="/favicon.png" alt="" className="w-full h-full object-cover rounded-xl" />
                </div>
                <span className="text-white font-extrabold text-xl tracking-tight">SkillBridge</span>
              </Link>

              <div className="space-y-3 mb-10">
                <p className="text-teal-300 text-sm font-semibold uppercase tracking-widest">
                  {isLogin ? 'Welcome back' : 'Join us today'}
                </p>
                <TypewriterHeading isLogin={isLogin} />
                <p className="text-white/50 text-sm leading-relaxed max-w-[220px]">
                  AI-powered job matching that understands your unique skills and potential.
                </p>
              </div>

              {/* Feature list */}
              <div className="space-y-3.5">
                <FeatureBadge icon="✦" text="Real-time AI resume analysis" />
                <FeatureBadge icon="✦" text="Live job market matching" />
                <FeatureBadge icon="✦" text="Smart skill gap insights" />
              </div>
            </div>

            {/* Bottom decoration dots */}
            <div className="flex gap-2 mt-10 relative z-10">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: n === 1 ? '2rem' : '0.5rem',
                    background: n === 1 ? 'rgba(139,92,246,0.9)' : 'rgba(139,92,246,0.2)',
                  }} />
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ─────────────────────────────────── */}
          <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center"
            style={{ background: 'rgba(6,6,12,0.96)' }}>
            <div className="max-w-sm mx-auto w-full">

              {/* Tab toggle */}
              <div className="flex gap-0 bg-white/5 rounded-xl p-1 mb-9 border border-white/8">
                {['Sign In', 'Sign Up'].map((label) => {
                  const active = label === 'Sign In' ? isLogin : !isLogin;
                  return (
                    <button key={label}
                      type="button"
                      onClick={() => switchMode(label === 'Sign In')}
                      className="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300"
                      style={{
                        background: active ? 'linear-gradient(135deg,#0d9488,#6366f1)' : 'transparent',
                        color: active ? 'white' : 'rgba(255,255,255,0.4)',
                        boxShadow: active ? '0 4px 20px rgba(13,148,136,0.4)' : 'none',
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Error message */}
              {errorMsg && (
                <div key={shakeKey}
                  className="mb-5 login-shake flex items-start gap-2 text-sm text-red-400 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full name — sign up only */}
                {!isLogin && (
                  <InputField
                    icon={<IconUser />}
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={setFullName}
                    required
                  />
                )}

                {/* Email */}
                <InputField
                  icon={<IconMail />}
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={setEmail}
                  required
                />

                {/* Password field with Peek-A-Boo Robot */}
                <div className="relative">
                  {/* Mascot positioned above the input */}
                  <div className={`absolute -top-12 right-4 transition-all duration-300 transform origin-bottom z-10 ${passwordFocused ? 'translate-y-2' : ''}`}>
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Body/Head */}
                      <rect x="20" y="30" width="60" height="70" rx="15" fill="#1e1b4b" stroke="#6366f1" strokeWidth="4"/>
                      <rect x="30" y="45" width="40" height="25" rx="8" fill="#0f172a" />
                      {/* Eyes */}
                      <circle cx="42" cy="57" r="4" fill="#2dd4bf" className={`transition-all duration-300 ${passwordFocused && !showPassword ? 'opacity-0 scale-0' : 'opacity-100 scale-100 animate-pulse'}`} />
                      <circle cx="58" cy="57" r="4" fill="#2dd4bf" className={`transition-all duration-300 ${passwordFocused && !showPassword ? 'opacity-0 scale-0' : 'opacity-100 scale-100 animate-pulse'}`} />
                      {/* Hands (only visible when focused) */}
                      <g className={`transition-all duration-300 origin-bottom ${passwordFocused && !showPassword ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <rect x="35" y="52" width="12" height="15" rx="4" fill="#818cf8" />
                        <rect x="53" y="52" width="12" height="15" rx="4" fill="#818cf8" />
                      </g>
                    </svg>
                  </div>
                  <div onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}>
                    <InputField
                      icon={<IconLock />}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={setPassword}
                      required
                      suffix={
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="text-white/30 hover:text-teal-400 transition-colors duration-200 p-1">
                          <IconEye open={showPassword} />
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* Password strength */}
                {!isLogin && <PasswordStrength password={password} />}

                {/* College + Role — sign up only */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <InputField icon={<IconBuilding />} type="text" placeholder="College" value={college} onChange={setCollege} required />
                    <InputField icon={<IconBriefcase />} type="text" placeholder="Target Role" value={desiredRole} onChange={setDesiredRole} required />
                  </div>
                )}

                {/* Forgot password — login only */}
                {isLogin && (
                  <div className="flex justify-end -mt-2">
                    <button type="button" className="text-xs text-white/35 hover:text-indigo-400 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full login-grad-btn text-white font-black py-3.5 rounded-xl transition-all duration-300 mt-2 text-sm uppercase tracking-[0.18em] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing…
                    </span>
                  ) : (isLogin ? 'Sign In →' : 'Create Account →')}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-xs text-white/25 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Google SSO (UI only) */}
                <button type="button"
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </form>

              {/* Bottom note */}
              <p className="mt-6 text-center text-xs text-white/20 leading-relaxed">
                By continuing, you agree to SkillBridge's{' '}
                <button type="button" className="text-teal-500/60 hover:text-teal-400 transition-colors">Terms</button>
                {' '}&amp;{' '}
                <button type="button" className="text-teal-500/60 hover:text-teal-400 transition-colors">Privacy Policy</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Reusable input field ──────────────────────────────────────────────── */
function InputField({ icon, type, placeholder, value, onChange, required, suffix }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;

  return (
    <div className="relative group">
      <div className="flex items-center rounded-xl px-3.5 py-3 transition-all duration-300"
        style={{
          background: focused ? 'rgba(13,148,136,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? 'rgba(20,184,166,0.55)' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(13,148,136,0.1)' : 'none',
        }}>
        {/* Icon */}
        <span className="shrink-0 mr-2.5 transition-colors duration-200"
          style={{ color: focused || filled ? '#14b8a6' : 'rgba(255,255,255,0.2)' }}>
          {icon}
        </span>

        {/* Input */}
        <input
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-white text-sm focus:outline-none min-w-0"
          style={{ caretColor: '#14b8a6' }}
        />

        {/* Suffix (e.g. show/hide password) */}
        {suffix && <span className="shrink-0 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
