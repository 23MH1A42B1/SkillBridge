import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addApplication } from '../services/applicationService';
import { useAuth } from '../auth/AuthContext';

export default function JobCard({ job }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [tracking, setTracking] = useState(false);

  const handleTrack = async () => {
    if(!user) return alert("Please login to track applications");
    try {
      setTracking(true);
      await addApplication(user.uid, job);
      alert("Added to Tracker! 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to track job.");
    } finally {
      setTracking(false);
    }
  };

  // Derive color based on match score
  const getScoreColor = (score) => {
    if(score >= 80) return 'text-green-400 border-green-500/30 bg-green-500/5 shadow-neon-glow';
    if(score >= 60) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5';
    return 'text-red-400 border-red-500/30 bg-red-500/5';
  };

  const getSourceBadge = (source) => {
    switch(source?.toLowerCase()) {
      case 'linkedin': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'naukri': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'indeed': return 'bg-blue-400/10 text-blue-300 border border-blue-400/20';
      default: return 'bg-white/5 text-gray-400 border border-white/10';
    }
  };

  const scoreClass = getScoreColor(job.matchScore || 0);

  return (
    <div className="glass-card overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
              {job.company?.charAt(0) || 'C'}
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-tight tracking-tight">{job.jobTitle || job.title}</h3>
              <p className="text-brand-400 font-bold text-sm uppercase tracking-widest mt-1">{job.company}</p>
              <div className="flex flex-wrap gap-4 mt-3 items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 opacity-80">📍 {job.location || 'Remote'}</span>
                <span className="flex items-center gap-1.5 opacity-80">💰 {job.salary || 'Not disclosed'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSourceBadge(job.source)}`}>
              {job.source || 'Scraped'}
            </span>
            {job.matchScore !== undefined && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-bold ${scoreClass}`}>
                <span className="text-lg">{job.matchScore}%</span>
                <span className="text-xs uppercase tracking-wide opacity-80">Match</span>
              </div>
            )}
          </div>
        </div>

        {/* Skill Gap Pills */}
        {(job.matchedSkills?.length > 0 || job.missingSkills?.length > 0) && (
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="mb-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Match Analysis</div>
            <div className="flex flex-wrap gap-2">
              {job.matchedSkills?.map(s => (
                <span key={s} className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">✓ {s}</span>
              ))}
              {job.missingSkills?.map(s => (
                <span key={s} className="px-2.5 py-1 bg-red-500/5 text-red-400/60 border border-red-500/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">✕ {s}</span>
              ))}
              {job.bonusSkills?.slice(0, 3).map(s => (
                <span key={s} className="px-2.5 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">+ {s}</span>
              ))}
            </div>
            {job.missingSkills?.length > 0 && (
              <div className="mt-4">
                <Link 
                  to={`/roadmap/${job.id || (job.userId + '_' + job.jobId)}`}
                  className="text-[10px] font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  🚀 Need these skills? View AI Learning Roadmap →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Primary Action (AI Features) */}
        <div className="mt-6 flex flex-col gap-4">
          
          {/* AI Copilot Features Header */}
          <div className="flex items-center gap-3 mb-1">
             <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
               AI Copilot Tools
             </span>
             <div className="h-px bg-white/5 flex-grow" />
          </div>

          {/* AI Feature Grid (Expanded) */}
          <div className="grid grid-cols-2 gap-3">
             <Link
               to={`/tailor-resume/${job.id || (job.userId + '_' + job.jobId)}`}
               className="group p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-brand-500/10 hover:border-brand-500/30 transition-all text-left relative overflow-hidden"
             >
               <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
               <h4 className="text-xs font-black text-gray-300 group-hover:text-brand-400 uppercase tracking-wide mb-1 flex items-center gap-2 transition-colors">✍️ AI Resume Tailor</h4>
               <p className="text-[9px] text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">Optimize bullets to match this exact job</p>
             </Link>

             <Link
               to={`/interview-prep/${job.id || (job.userId + '_' + job.jobId)}`}
               className="group p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-left relative overflow-hidden"
             >
               <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
               <h4 className="text-xs font-black text-gray-300 group-hover:text-indigo-400 uppercase tracking-wide mb-1 flex items-center gap-2 transition-colors">🎯 Mock Interview</h4>
               <p className="text-[9px] text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">Practice voice AI questions for this role</p>
             </Link>

             <Link
               to={`/roadmap/${job.id || (job.userId + '_' + job.jobId)}`}
               className="group p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-violet-500/10 hover:border-violet-500/30 transition-all text-left relative overflow-hidden"
             >
               <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
               <h4 className="text-xs font-black text-gray-300 group-hover:text-violet-400 uppercase tracking-wide mb-1 flex items-center gap-2 transition-colors">🚀 Skill Roadmap</h4>
               <p className="text-[9px] text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">Generate learning path for missing skills</p>
             </Link>

             <button
               onClick={handleTrack}
               disabled={tracking}
               className="group p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-teal-500/10 hover:border-teal-500/30 transition-all text-left relative overflow-hidden disabled:opacity-50"
             >
               <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
               <h4 className="text-xs font-black text-gray-300 group-hover:text-teal-400 uppercase tracking-wide mb-1 flex items-center gap-2 transition-colors">📁 Job Tracker</h4>
               <p className="text-[9px] text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">{tracking ? 'Adding to board...' : 'Save to your Kanban board'}</p>
             </button>
          </div>

          {/* Secondary External Action */}
          <div className="mt-2 flex flex-wrap gap-2">
            {(job.applyOptions?.length > 0) ? (
              job.applyOptions.map((opt, i) => (
                <a
                  key={i}
                  href={opt.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all bg-white/[0.03] text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                >
                  {opt.title || 'Apply External'} ↗
                </a>
              ))
            ) : (job.jobUrl || job.url) ? (
              <a
                href={job.jobUrl || job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all bg-white/[0.03] text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
              >
                Apply Externally ↗
              </a>
            ) : (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent((job.jobTitle || job.title) + ' ' + (job.company || '') + ' careers apply')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all bg-white/[0.03] text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
              >
                Search Application on Google ↗
              </a>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 mt-1 text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-colors"
          >
            {expanded ? 'Collapse Details △' : 'View Full Insights ▽'}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="bg-dark-lighter/50 p-8 border-t border-white/5 text-sm text-gray-400 animate-slide-up">
          <h4 className="font-bold text-white mb-3 uppercase tracking-widest text-xs">Detailed Summary</h4>
          <p className="mb-6 leading-relaxed opacity-80">
            {job.aiReasoning || `This role at ${job.company} aligns with your core profile. You are expected to have minimum ${job.experience || '2'} years of professional experience in ${job.jobTitle || job.title} or similar roles.`}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Scraped via {job.source || 'SerpAPI'}</p>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(job.timestamp || job.scrapedAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
