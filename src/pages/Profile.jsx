import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import SkillCard from '../components/SkillCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import TiltCard from '../components/TiltCard';
import CircleProgress from '../components/CircleProgress';
import SkillConstellation from '../components/SkillConstellation';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';
import { generateLinkedInPost } from '../services/aiService';

const SKILL_BADGES = {
  'technical': { icon: '💻', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'soft': { icon: '🧠', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'tools': { icon: '🛠️', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  'elite': { icon: '🏆', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
};

/* Avatar colour derived from first letter */
const AVATAR_COLORS = [
  'from-violet-600 to-indigo-600',
  'from-teal-500 to-cyan-600',
  'from-pink-600 to-rose-500',
  'from-amber-500 to-orange-600',
  'from-green-500 to-emerald-600',
];
const avatarGradient = (char) =>
  AVATAR_COLORS[(char?.toUpperCase().charCodeAt(0) || 65) % AVATAR_COLORS.length];

export default function Profile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState(null);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInPost, setLinkedInPost] = useState('');
  const [generatingPost, setGeneratingPost] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const skillsData = await getUserSkills(user.uid);
        setUserSkills(skillsData);
      } catch (err) {
        console.error('Profile load err', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleGeneratePost = async () => {
    if (!userSkills) return;
    setGeneratingPost(true);
    setShowLinkedInModal(true);
    try {
      const post = await generateLinkedInPost(userSkills);
      setLinkedInPost(post);
    } catch (err) {
      console.error(err);
      setLinkedInPost("Failed to generate post. Please try again.");
    } finally {
      setGeneratingPost(false);
    }
  };

  const initial = (profile?.fullName || user?.email || 'U').charAt(0).toUpperCase();
  const totalSkills =
    (userSkills?.skills?.technical?.length || 0) +
    (userSkills?.skills?.tools?.length || 0) +
    (userSkills?.skills?.soft?.length || 0);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-brand-400 text-xs font-black uppercase tracking-widest mb-2">My Profile</p>
            <h1 className="text-4xl font-black text-white tracking-tight">Your Skill Profile</h1>
            <p className="text-gray-400 mt-2 font-medium">Detailed breakdown of your ATS readiness and technical capabilities.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/upload" className="btn-secondary rounded-full px-6">Re-Upload Resume</Link>
            <Link to="/jobs" className="btn-primary rounded-full px-8 shadow-neon-glow">Find Jobs</Link>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : !userSkills ? (
          <div className="bg-dark-card rounded-3xl border border-white/5 p-20 text-center shadow-2xl">
            <div className="w-20 h-20 bg-brand-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-brand-500/20">👤</div>
            <h2 className="text-2xl font-black text-white mb-3">No Profile Data</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              You haven't uploaded a resume yet to generate your skill profile.
            </p>
            <Link to="/upload" className="btn-primary rounded-full px-10 py-4 shadow-neon-glow">Upload Resume Now</Link>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">

            {/* ── Hero Identity Card ──────────────────────────────── */}
            <TiltCard
              intensity={4}
              glare={true}
              className="bg-dark-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden"
            >
              {/* Top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 via-indigo-500 to-teal-500" />

              <div className="p-10 flex flex-col md:flex-row items-center gap-10">

                {/* Animated avatar */}
                <div className="relative shrink-0">
                  {/* Outer pulse ring */}
                  <div className="absolute inset-0 rounded-[40px] animate-ping opacity-20"
                    style={{ background: 'rgba(124,58,237,0.4)', animationDuration: '3s' }} />
                  {/* Avatar */}
                  <div className={`relative h-32 w-32 rounded-[40px] bg-gradient-to-br ${avatarGradient(initial)} flex items-center justify-center text-5xl font-black text-white shadow-2xl border border-white/10`}>
                    {initial}
                  </div>
                  {/* Online badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-dark-card shadow-lg"
                    title="Profile active" />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <h2 className="text-3xl font-black text-white tracking-tight truncate">
                    {profile?.fullName || user.email}
                  </h2>
                  <p className="text-brand-400 font-black text-sm uppercase tracking-[0.2em] mt-1">
                    {profile?.desiredRole || 'Job Seeker'}
                  </p>


                  {/* Badges Section */}
                  <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                    {userSkills.atsScore?.total > 80 && (
                      <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs font-black uppercase tracking-widest ${SKILL_BADGES.elite.color} animate-pulse-slow`}>
                        {SKILL_BADGES.elite.icon} Elite Candidate
                      </div>
                    )}
                    {userSkills.skills?.technical?.slice(0, 2).map(s => (
                      <div key={s} className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${SKILL_BADGES.technical.color}`}>
                        {SKILL_BADGES.technical.icon} {s} Pro
                      </div>
                    ))}
                    {userSkills.skills?.soft?.slice(0, 1).map(s => (
                      <div key={s} className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${SKILL_BADGES.soft.color}`}>
                        {SKILL_BADGES.soft.icon} {s} Leader
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score rings */}
                <div className="shrink-0 flex flex-col gap-6 items-center">
                  <div className="flex gap-6">
                    <div className="text-center">
                      <CircleProgress value={userSkills.profileScore || 0} size={80} stroke={6} />
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Profile</p>
                    </div>
                    <div className="text-center">
                      <CircleProgress value={userSkills.atsScore?.total || 0} size={80} stroke={6} />
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">ATS</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleGeneratePost}
                    className="w-full btn-secondary rounded-xl py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-brand-500/20 hover:border-brand-500/40"
                  >
                    🔗 LinkedIn Power Post
                  </button>
                </div>

                {/* Resume link */}
                {userSkills.resumeUrl && (
                  <div className="shrink-0">
                    <a
                      href={userSkills.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary rounded-xl flex items-center gap-2 transition-all hover:border-brand-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Resume
                    </a>
                  </div>
                )}
              </div>
            </TiltCard>

            {/* ── 3D Constellation ───────────────────────────────── */}
            <SkillConstellation skills={userSkills?.skills?.technical || []} />

            {/* ── Skill Breakdown ─────────────────────────────────── */}
            <SkillCard analysis={userSkills} />

            {/* ── CTA Banner ──────────────────────────────────────── */}
            <TiltCard
              intensity={3}
              className="bg-dark-card border border-white/5 rounded-3xl p-12 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] -mr-32 -mt-32"
                style={{ background: 'rgba(124,58,237,0.12)' }} />
              <div className="absolute bottom-0 left-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div>
                  <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-3">Next Step</p>
                  <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Ready to test these skills?</h3>
                  <p className="text-gray-400 max-w-xl text-lg font-medium leading-relaxed">
                    Your profile is locked and loaded. Run a match against real-time job listings to see where your exact skills are needed right now.
                  </p>
                </div>
                <Link
                  to="/jobs"
                  className="btn-primary rounded-full shadow-neon-glow whitespace-nowrap text-lg px-12 py-4 shrink-0 glow-pulse"
                >
                  Run Live Match →
                </Link>
              </div>
            </TiltCard>

          </div>
        )}
      </div>

      {/* LinkedIn Post Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-dark-bg/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-dark-card border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1">AI Generated</p>
                <h3 className="text-2xl font-black text-white">LinkedIn Power Post</h3>
              </div>
              <button onClick={() => setShowLinkedInModal(false)} className="text-gray-500 hover:text-white text-2xl">✕</button>
            </div>

            {generatingPost ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">AI is writing your story...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-gray-300 leading-relaxed font-medium whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                  {linkedInPost}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(linkedInPost);
                      alert("Copied to clipboard!");
                    }}
                    className="flex-1 btn-secondary rounded-2xl py-4 font-black uppercase tracking-widest text-xs"
                  >
                    📋 Copy Text
                  </button>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(linkedInPost)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary rounded-2xl py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    🚀 Post to LinkedIn
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
