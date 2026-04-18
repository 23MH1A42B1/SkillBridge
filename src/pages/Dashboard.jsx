import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AppLayout from '../components/AppLayout';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import TiltCard from '../components/TiltCard';
import CircleProgress from '../components/CircleProgress';
import { useCountUp } from '../hooks/useCountUp';
import { getUserSkills } from '../services/resumeService';
import { getMyMatches } from '../services/matchService';
import MarketIntelligence from '../components/MarketIntelligence';


export default function Dashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [kpiVisible, setKpiVisible] = useState(false);
  const kpiRef = useRef(null);

  // Trigger count-up when KPI grid enters the viewport
  useEffect(() => {
    if (loading || !kpiRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setKpiVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(kpiRef.current);
    return () => obs.disconnect();
  }, [loading]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const [skills, matches] = await Promise.all([
          getUserSkills(user.uid),
          getMyMatches(user.uid),
        ]);
        setUserSkills(skills);
        setTopMatches(matches?.slice(0, 3) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-brand-400 text-xs font-black uppercase tracking-widest mb-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Welcome back, {profile?.fullName?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Here's your career progress overview today.</p>
          </div>
          {userSkills && (
            <Link to="/upload" className="btn-secondary">Update Resume</Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            <LoadingSkeleton type="stat" count={4} />
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : !userSkills ? (
          <div className="bg-dark-card rounded-3xl border border-white/5 p-16 text-center shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-600" />
            <div className="w-24 h-24 bg-brand-600/10 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl border border-brand-500/20 shadow-neon-purple">📄</div>
            <h2 className="text-3xl font-black text-white mb-3">No Resume Found</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              Upload your resume so our AI can extract your skills, estimate your ATS score, and match you with jobs.
            </p>
            <Link to="/upload" className="btn-primary text-lg px-10 py-4 rounded-full shadow-neon-glow">Upload Resume</Link>
          </div>
        ) : (
          <div className="space-y-10 animate-fade-in">
            {/* ── KPI Cards ──────────────────────────────────── */}
            <div ref={kpiRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Profile Score',
                  value: userSkills.profileScore,
                  hasRing: true,
                  accent: 'from-violet-600/20 to-purple-600/10',
                  border: 'border-violet-500/10',
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                  iconBg: 'bg-violet-500/10 text-violet-400',
                },
                {
                  label: 'ATS Quality',
                  value: userSkills.atsScore?.total || 0,
                  hasRing: true,
                  accent: 'from-indigo-600/20 to-blue-600/10',
                  border: 'border-indigo-500/10',
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  iconBg: 'bg-indigo-500/10 text-indigo-400',
                },
                {
                  label: 'Top Matches',
                  value: topMatches.length,
                  hasRing: false,
                  accent: 'from-green-600/20 to-emerald-600/10',
                  border: 'border-green-500/10',
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                  iconBg: 'bg-green-500/10 text-green-400',
                  badge: topMatches.length > 0,
                },
                {
                  label: 'Total Skills',
                  value: (userSkills.skills?.technical?.length || 0) + (userSkills.skills?.tools?.length || 0) + (userSkills.skills?.soft?.length || 0),
                  hasRing: false,
                  accent: 'from-pink-600/20 to-rose-600/10',
                  border: 'border-pink-500/10',
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                  iconBg: 'bg-pink-500/10 text-pink-400',
                },
              ].map((card) => (
                <KpiCard key={card.label} {...card} trigger={kpiVisible} />
              ))}
            </div>

            {/* ── Market Intelligence ────────────────────────── */}
            <MarketIntelligence jobMatches={topMatches} />

            {/* ── Top Matches ─────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">Your Top Job Matches</h2>
                {topMatches.length > 0 && (
                  <Link to="/jobs" className="text-brand-400 hover:text-brand-300 font-bold text-xs uppercase tracking-widest transition-colors">
                    View All Platforms →
                  </Link>
                )}
              </div>

              {topMatches.length === 0 ? (
                <div className="bg-dark-card p-12 rounded-3xl border border-white/5 text-center shadow-xl">
                  <p className="text-gray-400 mb-6 text-lg">You have a resume, but haven't run any job matches yet.</p>
                  <Link to="/jobs" className="btn-primary px-8 py-3 rounded-full">Find Jobs Now</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {topMatches.map(match => (
                    <JobCard key={match.id} job={match} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/* ── KpiCard sub-component ──────────────────────────────────────── */
function KpiCard({ label, value, hasRing, accent, border, icon, iconBg, badge, trigger }) {
  const count = useCountUp(value, 1400, trigger);

  return (
    <TiltCard
      intensity={8}
      className={`bg-gradient-to-br ${accent} bg-dark-card p-6 rounded-3xl border ${border} shadow-xl relative overflow-hidden stagger-item`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {badge && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />}
      </div>

      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{label}</p>

      {hasRing ? (
        <div className="flex items-center gap-4">
          <CircleProgress value={trigger ? value : 0} size={72} stroke={5} />
          <div>
            <p className="text-3xl font-black text-white">{count}<span className="text-sm text-gray-600 ml-0.5">/100</span></p>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">
              {value >= 80 ? '🟢 Excellent' : value >= 60 ? '🟡 Good' : '🔴 Needs Work'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-4xl font-black text-white">{count}</p>
      )}
    </TiltCard>
  );
}
