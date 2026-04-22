import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMatchById } from '../services/matchService';
import { generateLearningRoadmap, saveRoadmap, getRoadmap } from '../services/roadmapService';
import AppLayout from '../components/AppLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Roadmap() {
  const { jobId } = useParams(); // This is the matchId
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      if (!user || !jobId) return;
      try {
        const matchData = await getMatchById(jobId);
        setMatch(matchData);

        if (!matchData) {
          setError("Match data not found.");
          setLoading(false);
          return;
        }

        const existing = await getRoadmap(user.uid, jobId);
        if (existing) {
          setRoadmap(existing);
        } else {
          const generated = await generateLearningRoadmap(matchData.missingSkills || [], matchData.jobTitle);
          setRoadmap(generated);
          await saveRoadmap(user.uid, jobId, generated);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user, jobId]);

  return (
    <AppLayout>
        <Link to="/jobs" className="text-brand-400 hover:text-brand-300 text-sm font-bold flex items-center gap-2 mb-8 uppercase tracking-widest transition-all">
          ← Back to Matches
        </Link>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-red-400 text-center font-bold shadow-2xl">
            {error}
          </div>
        ) : (
          <div className="animate-fade-in">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-dark-card p-10 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
              <div className="relative z-10">
                <p className="text-brand-400 font-black text-xs uppercase tracking-[0.2em] mb-2">Personalized Learning Journey</p>
                <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Mastering {match?.jobTitle}</h1>
                <p className="text-gray-400 mt-2 font-medium">Bridge the gap at <span className="text-indigo-400">@{match?.company}</span> with this AI-curated path.</p>
              </div>
              <div className="shrink-0 bg-brand-500/10 border border-brand-500/20 px-6 py-4 rounded-2xl text-center shadow-neon-purple">
                 <div className="text-2xl font-black text-white">{match?.matchScore}%</div>
                 <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Match Score</div>
              </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
              {/* Left Column: The Roadmap */}
              <div className="lg:col-span-2 space-y-12 relative">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-brand-500/50 via-indigo-500/50 to-transparent hidden md:block"></div>

                {roadmap.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-0 md:pl-16">
                    {/* Circle Pin */}
                    <div className="absolute left-0 top-0 w-14 h-14 rounded-2xl bg-dark-card border border-white/10 flex items-center justify-center z-10 shadow-xl hidden md:flex">
                        <span className="text-brand-400 font-black text-lg">{idx + 1}</span>
                    </div>

                    <div className="bg-dark-card border border-white/5 p-8 rounded-3xl shadow-xl hover:border-brand-500/30 transition-all group">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h3 className="text-xl font-black text-white group-hover:text-brand-400 transition-colors uppercase tracking-tight">{step.title}</h3>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 border border-white/5">
                          ⏱️ {step.estimatedTime}
                        </span>
                      </div>
                      <p className="text-gray-400 leading-relaxed mb-6 font-medium">{step.description}</p>
                      
                      <div className="space-y-3">
                        {step.resources.map((res, rIdx) => (
                          <a 
                            key={rIdx} 
                            href={res.searchUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 rounded-2xl bg-dark-bg/50 border border-white/5 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group/res"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg opacity-60">{res.type === 'Video' ? '🎬' : '📚'}</span>
                              <span className="text-sm font-bold text-gray-300 group-hover/res:text-white transition-colors">{res.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest bg-brand-500/10 px-2 py-1 rounded-md opacity-0 group-hover/res:opacity-100 transition-opacity">Launch →</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Skills Sidebar */}
              <div className="space-y-8">
                 <div className="bg-dark-card border border-white/5 p-8 rounded-3xl shadow-2xl sticky top-28">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Your Skill Gap</h4>
                    <div className="space-y-6">
                       <div>
                          <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Missing (Target Focus)</div>
                          <div className="flex flex-wrap gap-2">
                             {match?.missingSkills?.map(s => (
                               <span key={s} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold">✕ {s}</span>
                             ))}
                          </div>
                       </div>
                       <div className="pt-6 border-t border-white/5">
                          <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-3">Already Mastered</div>
                          <div className="flex flex-wrap gap-2">
                             {match?.matchedSkills?.map(s => (
                               <span key={s} className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold">✓ {s}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-10 p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
                       <p className="text-xs font-bold text-indigo-300 leading-relaxed italic">
                         "This roadmap is generated by AI to help you specifically target the gaps identified in this job matching analysis."
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
    </AppLayout>
  );
}
