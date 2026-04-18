import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Typewriter from '../components/Typewriter';
import TiltCard from '../components/TiltCard';

/* ── Inline keyframes (non-Tailwind animations) ─────────────────── */
const styles = `
  @keyframes landingFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes landingGradShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes orbit1 {
    from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
  }
  @keyframes orbit2 {
    from { transform: rotate(180deg) translateX(240px) rotate(-180deg); }
    to   { transform: rotate(540deg) translateX(240px) rotate(-540deg); }
  }
  @keyframes orbit3 {
    from { transform: rotate(60deg) translateX(310px) rotate(-60deg); }
    to   { transform: rotate(420deg) translateX(310px) rotate(-420deg); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .landing-fade-up   { animation: landingFadeUp 0.7s ease-out both; }
  .landing-fade-up-2 { animation: landingFadeUp 0.7s 0.15s ease-out both; }
  .landing-fade-up-3 { animation: landingFadeUp 0.7s 0.28s ease-out both; }
  .landing-grad-text {
    background: linear-gradient(135deg, #2dd4bf, #818cf8, #a78bfa, #2dd4bf);
    background-size: 300% 300%;
    animation: landingGradShift 5s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .landing-btn-primary {
    background: linear-gradient(135deg, #0d9488, #6366f1);
    transition: all 0.3s ease;
  }
  .landing-btn-primary:hover {
    box-shadow: 0 0 28px rgba(13,148,136,0.55), 0 8px 24px rgba(0,0,0,0.3);
    transform: translateY(-2px);
  }
  .orbit-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    border: 1px solid rgba(124,58,237,0.15);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .orbit-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin: -5px;
  }
  .orbit-dot-1 { animation: orbit1 14s linear infinite; background: rgba(45,212,191,0.9); box-shadow: 0 0 12px rgba(45,212,191,0.8); }
  .orbit-dot-2 { animation: orbit2 20s linear infinite; background: rgba(129,140,248,0.9); box-shadow: 0 0 12px rgba(129,140,248,0.8); }
  .orbit-dot-3 { animation: orbit3 26s linear infinite; background: rgba(167,139,250,0.9); box-shadow: 0 0 12px rgba(167,139,250,0.8); }
  .stat-num { animation: countUp 0.6s ease-out both; }
`;

const STATS = [
  { value: '10k+', label: 'Active Users', delay: '0s' },
  { value: '50k+', label: 'Live Jobs', delay: '0.1s' },
  { value: '85%',  label: 'Match Accuracy', delay: '0.2s' },
  { value: '2.4M', label: 'Skills Analyzed', delay: '0.3s' },
];

const HOW_IT_WORKS = [
  { num: '1', title: 'Upload Resume', desc: 'Simply upload your resume. Our AI instantly extracts your professional timeline and core skills.', icon: '📄' },
  { num: '2', title: 'Get AI Analysis', desc: 'Receive a detailed ATS score and skill gap analysis tailored specifically to your desired role.', icon: '🤖' },
  { num: '3', title: 'Match & Apply', desc: 'Explore real-time job listings matched perfectly to your profile, and receive email alerts.', icon: '🎯' },
];

const FEATURES = [
  { emoji: '🎯', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', title: 'AI Interview Coach', desc: 'Generate personalized behavioral and technical questions tailored to specific job descriptions.' },
  { emoji: '✍️', color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.2)', title: 'Dynamic Resume Tailoring', desc: 'Get side-by-side AI suggestions to optimize your resume bullet points for 90%+ match scores.' },
  { emoji: '🚀', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', title: 'Smart Career Roadmap', desc: 'Instantly identify skill gaps and follow a curated, step-by-step learning path to bridge them.' },
  { emoji: '📁', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', title: 'Application Tracker', desc: 'Manage your entire job search pipeline with a private, professional Kanban-style tracker.' },
  { emoji: '🌐', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', title: 'Browser Extension', desc: 'Analyze job matches directly on LinkedIn and Indeed without ever leaving your browser.' },
  { emoji: '✉️', color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)', title: 'Daily Email Alerts', desc: 'Receive high-match job notifications directly in your inbox as soon as they are scraped.' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Full Stack Developer', text: "SkillBridge's AI matching was scarily accurate. It found a role at a fintech startup I had never heard of, and the interview prep questions were almost identical to what I was asked!", avatar: 'SC' },
  { name: 'James Wilson', role: 'Product Manager', text: 'The resume tailoring feature is a game changer. I saw my match score jump from 65% to 92% just by following the AI suggestions. Secured an interview within 48 hours.', avatar: 'JW' },
  { name: 'Priya Sharma', role: 'Data Scientist', text: 'As someone pivoting careers, the Learning Roadmap was invaluable. It gave me a clear path to bridge my cloud computing gaps, which eventually led to my current role.', avatar: 'PS' },
];

/* Scroll reveal hook */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function Landing() {
  useScrollReveal();

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen flex flex-col font-sans" style={{ background: '#050507' }}>
        <Navbar />

        <main className="flex-grow pt-16">

          {/* ── HERO ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>

            {/* BG glows */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)', filter: 'blur(90px)' }} />
              <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(80px)' }} />
              {/* Grid */}
              <div className="absolute inset-0 opacity-[0.07]" style={{
                backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.3) 1px,transparent 1px)',
                backgroundSize: '60px 60px',
              }} />
            </div>

            {/* 3D Orbit rings (right side) */}
            <div className="absolute right-[8%] top-1/2 -translate-y-1/2 hidden xl:block" style={{ width: 640, height: 640 }}>
              {[380, 480, 620].map((size, i) => (
                <div key={i} className="orbit-ring" style={{ width: size, height: size }} />
              ))}
              {/* Central glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)', filter: 'blur(12px)' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-[20px] bg-dark-card border border-brand-500/30 flex items-center justify-center shadow-lg overflow-hidden z-10">
                <img src="/logo.png" alt="SkillBridge Logo" className="w-full h-full object-cover" />
              </div>
              {/* Orbiting dots */}
              <div className="orbit-dot orbit-dot-1" />
              <div className="orbit-dot orbit-dot-2" />
              <div className="orbit-dot orbit-dot-3" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 w-full relative z-10">
              {/* Badge */}
              <div className="landing-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#2dd4bf' }}>
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                AI-Powered Career Platform
              </div>

              <h1 className="landing-fade-up-2 text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-8 text-white max-w-3xl">
                Land Your Dream Job with{' '}
                <span className="landing-grad-text">
                  <Typewriter
                    words={['AI Job Matching', 'Smart Skill Gap AI', 'Resume Tailoring AI', 'Interview AI Coach']}
                    typingMs={60}
                    deletingMs={30}
                    pauseMs={2200}
                  />
                </span>
              </h1>

              <p className="landing-fade-up-3 max-w-xl text-xl text-white/50 mb-12 leading-relaxed">
                SkillBridge is your AI-powered career co-pilot — offering resume tailoring, interview prep, skill roadmaps, and automated job tracking.
              </p>

              <div className="landing-fade-up-3 flex flex-col sm:flex-row gap-4">
                <Link to="/upload"
                  className="landing-btn-primary glow-pulse inline-flex items-center justify-center gap-2 text-white font-bold text-lg px-10 py-4 rounded-xl">
                  Upload Resume Now →
                </Link>
                <Link to="/login"
                  className="inline-flex items-center justify-center gap-2 font-bold text-lg px-10 py-4 rounded-xl text-white/70 hover:text-white transition-all duration-300"
                  style={{ background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(20,184,166,0.15)' }}>
                  Explore Features
                </Link>
              </div>

              {/* Floating badge */}
              <div className="float-badge mt-20 inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{ background: 'rgba(6,13,24,0.9)', border: '1px solid rgba(13,148,136,0.25)' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/70 text-sm font-semibold">Live · 50,000+ Jobs Updated Daily</span>
              </div>
            </div>
          </section>

          {/* ── STATS ────────────────────────────────────────── */}
          <section className="py-16 relative overflow-hidden reveal"
            style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(99,102,241,0.1) 100%)', borderTop: '1px solid rgba(20,184,166,0.15)', borderBottom: '1px solid rgba(20,184,166,0.15)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {STATS.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className={`text-4xl md:text-5xl font-black landing-grad-text stat-num`}
                      style={{ animationDelay: s.delay }}>{s.value}</span>
                    <span className="text-white/40 text-sm font-bold uppercase tracking-widest">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────── */}
          <section className="py-28" style={{ background: '#050507' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="reveal text-teal-400 text-xs font-black uppercase tracking-widest mb-4">Process</p>
              <h2 className="reveal reveal-delay-1 text-4xl font-black text-white tracking-tight mb-4">How SkillBridge Works</h2>
              <p className="reveal reveal-delay-2 text-white/40 max-w-xl mx-auto mb-16 text-lg">Three simple steps to transform your job search with the power of AI.</p>

              <div className="grid md:grid-cols-3 gap-8">
                {HOW_IT_WORKS.map((item, i) => (
                  <TiltCard
                    key={item.num}
                    intensity={6}
                    className="reveal p-10 rounded-3xl text-left relative overflow-hidden group"
                    style={{
                      background: 'rgba(6,13,24,0.9)',
                      border: '1px solid rgba(13,148,136,0.15)',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-8 transition-all duration-300"
                      style={{ background: 'rgba(13,148,136,0.15)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.25)' }}>
                      {item.num}
                    </div>
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                    <p className="text-white/40 leading-relaxed">{item.desc}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg, #0d9488, #6366f1)' }} />
                  </TiltCard>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ──────────────────────────────────────── */}
          <section className="py-28" style={{ background: 'rgba(12,12,20,0.95)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="reveal text-teal-400 text-xs font-black uppercase tracking-widest mb-4 text-center">Features</p>
              <h2 className="reveal reveal-delay-1 text-4xl font-black text-white text-center tracking-tight mb-4">Everything You Need to Succeed</h2>
              <p className="reveal reveal-delay-2 text-white/40 max-w-xl mx-auto mb-16 text-center text-lg">Built for modern job seekers who want an unfair advantage in the market.</p>

              <div className="grid md:grid-cols-2 gap-6">
                {FEATURES.map((f, i) => (
                  <TiltCard
                    key={i}
                    intensity={5}
                    glare={true}
                    className="reveal p-8 rounded-3xl flex gap-6 items-start group"
                    style={{
                      background: 'rgba(6,13,24,0.9)',
                      border: '1px solid rgba(13,148,136,0.15)',
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
                      style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                      {f.emoji}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white mb-2">{f.title}</h4>
                      <p className="text-white/40 leading-relaxed">{f.desc}</p>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ──────────────────────────────────── */}
          <section className="py-28" style={{ background: '#050507' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="reveal text-violet-400 text-xs font-black uppercase tracking-widest mb-4 text-center">Success Stories</p>
              <h2 className="reveal reveal-delay-1 text-4xl font-black text-white text-center tracking-tight mb-16">Trusted by Thousands of Professionals</h2>

              <div className="grid md:grid-cols-3 gap-8">
                {TESTIMONIALS.map((t, i) => (
                  <TiltCard
                    key={i}
                    intensity={5}
                    className="reveal p-10 rounded-[2.5rem] relative group"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    <div className="text-brand-400 text-3xl mb-6 opacity-30 group-hover:opacity-100 transition-opacity">"</div>
                    <p className="text-white/60 leading-relaxed mb-10 italic">"{t.text}"</p>
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {t.avatar}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm leading-none mb-1">{t.name}</h4>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest leading-none">{t.role}</p>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────── */}
          <section className="py-28 relative overflow-hidden reveal" style={{ background: '#050507' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <div className="p-16 rounded-3xl relative overflow-hidden" style={{
                background: 'rgba(6,13,24,0.9)',
                border: '1px solid rgba(13,148,136,0.3)',
                boxShadow: '0 0 60px rgba(13,148,136,0.12)',
              }}>
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-violet-500 to-indigo-500" />
                <div className="text-6xl mb-6 float-badge inline-block">🚀</div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-4">Ready to find your perfect job?</h2>
                <p className="text-white/50 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                  Join thousands of job seekers optimising their careers with SkillBridge.
                </p>
                <Link to="/upload"
                  className="landing-btn-primary glow-pulse inline-flex items-center gap-2 text-white font-black text-lg px-12 py-4 rounded-xl">
                  Get Started for Free →
                </Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}
