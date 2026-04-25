import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';
import { performSmartSearch } from '../services/smartSearchService';
import JobGlobe from '../components/JobGlobe';

export default function SmartSearch() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("🚀 Run Strategic Search");
  const [initialLoading, setInitialLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [userSkills, setUserSkills] = useState(null);
  
  const [filters, setFilters] = useState({
    location: 'India',
    days: '7',
    limit: '20'
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const skillsData = await getUserSkills(user.uid);
        setUserSkills(skillsData);
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSearch = async () => {
    if (!userSkills) return;
    setLoading(true);
    setLoadingText("Initializing ML Engine...");
    try {
      const data = await performSmartSearch(user, profile, userSkills, filters, setLoadingText);
      setResults(data);
    } catch (err) {
      console.error("Smart Search failed", err);
      alert("Search failed. Check your API keys and try again.");
    } finally {
      setLoading(false);
      setLoadingText("🚀 Run Strategic Search");
    }
  };

  return (
    <AppLayout>
        
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <span className="text-5xl drop-shadow-neon-glow">🎯</span> Strategic AI Job Search
          </h1>
          <p className="text-gray-400 mt-3 font-medium text-lg max-w-2xl leading-relaxed">
            AI-powered live analysis across major platforms. We match your deep resume context against the live market with strategic reasoning.
          </p>
        </div>

        {/* Search Controls */}
        <div className="bg-dark-card p-10 rounded-3xl mb-12 grid md:grid-cols-4 gap-8 items-end shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-600"></div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Location</label>
            <input 
              type="text" 
              className="w-full bg-dark-bg border border-white/10 text-white rounded-xl py-3 px-4 focus:ring-brand-500 focus:border-brand-500 transition-all font-bold placeholder:text-gray-700" 
              value={filters.location} 
              onChange={e => setFilters({...filters, location: e.target.value})}
              placeholder="e.g. India, Remote, USA"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Posted Within</label>
            <select 
              className="w-full bg-dark-bg border border-white/10 text-white rounded-xl py-3 px-4 focus:ring-brand-500 focus:border-brand-500 transition-all font-bold" 
              value={filters.days}
              onChange={e => setFilters({...filters, days: e.target.value})}
            >
              <option value="1">Last 24 Hours</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Target Role</label>
            <div className="py-3 px-4 bg-dark-bg/50 border border-white/5 rounded-xl text-brand-400 font-black tracking-tight text-sm">
              {profile?.desiredRole || 'Standard Search'}
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading || !userSkills}
            className="btn-primary py-3.5 flex items-center justify-center gap-3 shadow-neon-glow rounded-xl font-black uppercase tracking-[0.1em] text-[10px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {loadingText}
              </>
            ) : "🚀 Run Strategic Search"}
          </button>
        </div>

        {initialLoading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : !userSkills ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Resume Profile Found</h2>
            <p className="text-gray-500 mb-6 text-sm">You must upload and analyze your resume first so the AI can match your skills.</p>
            <a href="/upload" className="btn-secondary">Upload Resume</a>
          </div>
        ) : results ? (
          <div className="space-y-8 animate-fade-in">
            {/* 3D Global Visualization */}
            <JobGlobe jobs={results.matches} />

            {/* Table Results */}
            <div className="bg-dark-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-dark-bg/50 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Match Quality</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Role & Company</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Requirements / Salary</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">AI Strategic Insight</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Apply</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.matches.map((job, idx) => (
                      <tr key={idx} className="hover:bg-brand-500/5 transition-colors group">
                        <td className="px-8 py-8">
                          <div className={`w-16 h-16 rounded-[20px] flex flex-col items-center justify-center border font-black shadow-lg
                            ${job.matchScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/5' : 
                              job.matchScore >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                              'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            <span className="text-2xl tracking-tighter">{job.matchScore}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="max-w-xs">
                            <div className="font-black text-white text-lg leading-tight group-hover:text-brand-400 transition-colors tracking-tight">
                              <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                            </div>
                            <div className="text-brand-500 font-black text-[11px] uppercase tracking-widest mt-2">{job.company}</div>
                            <div className="flex gap-3 mt-4 items-center text-[10px] text-gray-600 font-black uppercase tracking-[0.1em]">
                              <span className="flex items-center gap-1">📍 {job.location}</span>
                              <span className="text-gray-800">/</span>
                              <span className="flex items-center gap-1">🌐 {job.source}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8 whitespace-nowrap">
                           <div className="text-xs font-black text-gray-300 tracking-tight flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                             {job.experience || 'Not specified'}
                           </div>
                           <div className="text-xs text-brand-400 font-black mt-2 tracking-tight flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                             {job.salary || 'Competitive'}
                           </div>
                        </td>
                        <td className="px-8 py-8 max-w-sm">
                          <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
                            "{job.matchReason}"
                          </p>
                          <div className="mt-4 flex gap-2 items-center flex-wrap">
                                {job.matchingSkills?.slice(0, 3).map(s => (
                                  <span key={s} className="px-2.5 py-1 bg-white/5 text-brand-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5 leading-none">✓ {s}</span>
                                ))}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-2">
                             <a 
                              href={job.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-primary py-2 px-4 shadow-md text-xs whitespace-nowrap text-center"
                             >
                               Direct Apply ↗
                             </a>
                             <a 
                              href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(job.company + ' HR Recruiter')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-center font-bold text-gray-400 hover:text-brand-600 transition-colors underline"
                             >
                               Find Hiring Manager
                             </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Keyword Suggestions */}
            <div className="bg-dark-card rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-[2] rotate-12 pointer-events-none">
                 <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
               </div>
               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-600 to-indigo-600"></div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-4 flex items-center gap-4 tracking-tight">
                   <span className="text-3xl drop-shadow-neon-glow">💡</span> Strategic Resume Upgrade
                 </h3>
                 <p className="text-gray-400 text-lg mb-10 max-w-2xl font-medium leading-relaxed">
                   Based on these search results, adding or highlighting these key terms will significantly improve your match score and ATS visibility for these roles.
                 </p>
                 <div className="flex flex-wrap gap-4">
                   {results.suggestions.map(token => (
                     <span key={token} className="px-6 py-3 bg-white/5 hover:bg-brand-600/20 border border-white/10 rounded-2xl text-white font-black text-sm transition-all cursor-default backdrop-blur-xl hover:border-brand-500/30 tracking-tight">
                       +{token}
                     </span>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-dark-card rounded-3xl p-20 text-center shadow-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-50"></div>
            <div className="text-7xl mb-10 drop-shadow-neon-glow grayscale opacity-50">🔍</div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready for a Strategic Scan?</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-12 text-lg font-medium leading-relaxed">
              Click the button above to perform a live, AI-driven scan of <b>LinkedIn, Naukri, and Indeed</b> tailored specifically to your profile context & seniority level.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-black text-gray-700 uppercase tracking-[0.3em]">
               <span className="hover:text-brand-400 transition-colors">LinkedIn</span>
               <span className="text-white/5">•</span>
               <span className="hover:text-brand-400 transition-colors">Indeed</span>
               <span className="text-white/5">•</span>
               <span className="hover:text-brand-400 transition-colors">Naukri</span>
               <span className="text-white/5">•</span>
               <span className="hover:text-brand-400 transition-colors">Career Pages</span>
            </div>
          </div>
        )}
    </AppLayout>
  );
}
