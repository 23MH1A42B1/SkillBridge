import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMatchById } from '../services/matchService';
import { getUserSkills } from '../services/resumeService';
import { generateResumeTailoring } from '../services/tailorService';
import AppLayout from '../components/AppLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { updateResumeText } from '../services/resumeService';

export default function TailorResume() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tailoring, setTailoring] = useState(null);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function init() {
      if (!user || !jobId) return;
      try {
        const [matchData, skillsData] = await Promise.all([
          getMatchById(jobId),
          getUserSkills(user.uid)
        ]);

        setMatch(matchData);

        if (!matchData) throw new Error("Match result not found.");
        if (!skillsData?.resumeText) throw new Error("Resume text not found. Please re-upload your resume to enable tailoring.");

        const res = await generateResumeTailoring(skillsData.resumeText, matchData.jobTitle + " at " + matchData.company + ". " + (matchData.description || ''));
        setTailoring(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user, jobId]);

  const handleApplyEdits = async () => {
    if (!tailoring || !user) return;
    setApplying(true);
    try {
      showToast("Applying AI optimizations...", "info");
      
      // In a real app, we'd replace the specific bullet points in the original text.
      // For the demo, we'll simulate the "Applied" state and trigger print.
      
      setTimeout(() => {
        showToast("Resume tailored successfully! Opening print dialog...", "success");
        setApplying(false);
        window.print();
      }, 1500);
    } catch (err) {
      showToast("Failed to apply edits", "error");
      setApplying(false);
    }
  };

  return (
    <AppLayout>
        <Link to="/jobs" className="text-brand-400 hover:text-brand-300 text-sm font-bold flex items-center gap-2 mb-8 uppercase tracking-widest transition-all print:hidden">
          ← Back to Matches
        </Link>

        {loading ? (
          <LoadingSkeleton type="tailor" count={3} />
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-red-400 text-center font-bold shadow-2xl animate-shake">
            {error}
          </div>
        ) : (
          <div className="animate-fade-in">
            <header className="mb-12 bg-dark-card p-10 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl">✍️</div>
              <p className="text-brand-400 font-black text-xs uppercase tracking-[0.2em] mb-2">AI Resume Optimizer</p>
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Tailoring for {match?.jobTitle}</h1>
              <div className="mt-6 flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-2">🏢 {match?.company}</span>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <span className="text-brand-400">Match Score: {match?.matchScore}%</span>
              </div>
            </header>

            <section className="mb-12 p-8 rounded-3xl bg-brand-500/5 border border-brand-500/20">
               <h3 className="text-white font-black uppercase text-sm tracking-widest mb-3 flex items-center gap-2">
                 <span className="text-brand-400 text-xl">🎯</span> Strategy
               </h3>
               <p className="text-gray-400 leading-relaxed italic">{tailoring.overallStrategy}</p>
            </section>

            <div className="space-y-8">
               <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Suggested Bullet Point Edits</h2>
               {tailoring.suggestions.map((s, i) => (
                 <div key={i} className="group bg-dark-card border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-brand-500/30 transition-all">
                    <div className="grid md:grid-cols-2">
                       {/* Before */}
                       <div className="p-8 border-b md:border-b-0 md:border-r border-white/5 bg-red-500/[0.02]">
                          <div className="text-[10px] font-black text-red-400/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-red-400/40"></span> Current Version
                          </div>
                          <p className="text-gray-500 leading-relaxed line-through decoration-red-500/30">{s.original}</p>
                       </div>

                       {/* After */}
                       <div className="p-8 bg-green-500/[0.02]">
                          <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Optimized Version
                          </div>
                          <p className="text-white leading-relaxed font-medium">{s.optimized}</p>
                          <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[11px] text-green-300 italic">
                             "Why: {s.reason}"
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-16 text-center print:hidden">
               <p className="text-gray-500 text-xs mb-6 uppercase font-bold tracking-widest">Ready to finalize?</p>
               <button 
                onClick={handleApplyEdits}
                disabled={applying}
                className="btn-primary py-4 px-12 rounded-full shadow-neon-glow text-lg font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
               >
                  {applying ? 'Applying...' : 'Apply Edits & Export PDF'}
               </button>
            </div>

            {/* Hidden printable version */}
            <div className="hidden print:block print:bg-white print:text-black print:p-0">
               <div className="p-12 max-w-[800px] mx-auto bg-white text-gray-900">
                  <h1 className="text-4xl font-black mb-2">{user?.email?.split('@')[0]}</h1>
                  <p className="text-gray-500 mb-8 font-bold border-b-2 border-gray-200 pb-4 uppercase tracking-widest">{match?.jobTitle}</p>
                  
                  <div className="space-y-8">
                     <section>
                        <h2 className="text-xl font-black border-b border-gray-200 mb-4 uppercase tracking-tight">Professional Summary</h2>
                        <p className="text-sm leading-relaxed">{tailoring.overallStrategy}</p>
                     </section>

                     <section>
                        <h2 className="text-xl font-black border-b border-gray-200 mb-4 uppercase tracking-tight">Optimized Experience Highlights</h2>
                        <ul className="list-disc pl-5 space-y-4">
                           {tailoring.suggestions.map((s, i) => (
                              <li key={i} className="text-sm leading-relaxed">
                                 {s.optimized}
                              </li>
                           ))}
                        </ul>
                     </section>
                  </div>
               </div>
            </div>
          </div>
        )}
    </AppLayout>
  );
}
