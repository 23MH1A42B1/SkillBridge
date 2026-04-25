import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills, setActiveResume, deleteResumeFromPortfolio } from '../services/resumeService';
import AppLayout from '../components/AppLayout';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const atsColor = (score) => score >= 80 ? 'text-green-400 bg-green-500/10 border-green-500/20' : score >= 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';

export default function ResumeManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const skills = await getUserSkills(user.uid);
      setData(skills);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSetActive = async (id) => {
    setLoading(true);
    await setActiveResume(user.uid, id);
    const updated = await getUserSkills(user.uid);
    setData(updated);
    setLoading(false);
    showToast('Resume set as active ✓', 'success');
  };

  const handleDelete = async (id) => {
    setConfirmDeleteId(null);
    setLoading(true);
    await deleteResumeFromPortfolio(user.uid, id);
    const updated = await getUserSkills(user.uid);
    setData(updated);
    setLoading(false);
    showToast('Resume deleted', 'info');
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-10">
           <div>
             <h1 className="text-4xl font-black text-white tracking-tight mb-2">Resume Portfolio</h1>
             <p className="text-gray-500 font-medium">Manage multiple versions of your professional profile.</p>
           </div>
           <div className="flex gap-4">
             <Link to="/resume-builder" className="btn-secondary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-all">
               ✨ AI Live Builder
             </Link>
             <Link to="/upload" className="btn-primary px-6 py-3 rounded-xl font-bold text-sm">
               + Upload PDF
             </Link>
           </div>
        </header>

        {loading ? (
          <div className="animate-pulse space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-4">
            {data?.resumes?.map((res) => {
              const atsScore = res.analysis?.atsScore?.total || 0;
              const isActive = data.activeResumeId === res.id;
              const isConfirming = confirmDeleteId === res.id;

              return (
                <div key={res.id} className={`p-6 rounded-2xl border transition-all group relative overflow-hidden
                  ${isActive
                    ? 'bg-brand-500/5 border-brand-500/30 shadow-[0_0_0_1px_rgba(124,58,237,0.1)]'
                    : 'bg-dark-card border-white/5 hover:border-white/10'}`}>

                  {/* Active left accent */}
                  {isActive && (
                    <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-brand-500 to-indigo-500 rounded-r" />
                  )}

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex gap-5 items-center min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0
                        ${isActive ? 'bg-brand-500 text-white shadow-neon-glow' : 'bg-white/5 text-gray-500'}`}>
                        {res.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-base flex items-center gap-2 flex-wrap">
                           {res.name}
                           {isActive && (
                             <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                               Active
                             </span>
                           )}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                            Uploaded {new Date(res.timestamp).toLocaleDateString()}
                          </p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${atsColor(atsScore)}`}>
                            ATS {atsScore}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {isConfirming ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                          <span className="text-xs text-gray-400 font-semibold mr-1">Delete?</span>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(res.id)}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isActive && (
                            <button
                              onClick={() => handleSetActive(res.id)}
                              className="px-4 py-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-500/20 transition-all"
                            >
                              Use This
                            </button>
                          )}
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white/5 text-gray-400 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                            title="Download"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                          <button
                            onClick={() => setConfirmDeleteId(res.id)}
                            className="p-2.5 bg-red-500/5 text-red-400/50 border border-red-500/10 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {(!data?.resumes || data.resumes.length === 0) && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📄</div>
                <p className="text-white font-bold text-lg mb-2">Your portfolio is empty</p>
                <p className="text-gray-500 text-sm mb-6">Upload your first resume to get started</p>
                <Link to="/upload" className="btn-primary px-8 py-3 rounded-full shadow-neon-glow">Upload Resume</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
