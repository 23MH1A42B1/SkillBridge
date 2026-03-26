import { useState } from 'react';

export default function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false);

  // Derive color based on match score
  const getScoreColor = (score) => {
    if(score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if(score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSourceBadge = (source) => {
    switch(source?.toLowerCase()) {
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'naukri': return 'bg-orange-100 text-orange-800';
      case 'indeed': return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-100 text-gray-800';
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
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{job.jobTitle || job.title}</h3>
              <p className="text-brand-600 font-medium">{job.company}</p>
              <div className="flex gap-2 mt-2 items-center text-sm text-gray-500">
                <span className="flex items-center gap-1">📍 {job.location || 'Remote'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">💰 {job.salary || 'Not disclosed'}</span>
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
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Skill Gap Analysis</div>
            <div className="flex flex-wrap gap-1.5">
              {job.matchedSkills?.map(s => (
                <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs">✓ {s}</span>
              ))}
              {job.missingSkills?.map(s => (
                <span key={s} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs opacity-80">✕ {s}</span>
              ))}
              {job.bonusSkills?.slice(0, 3).map(s => (
                <span key={s} className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded text-xs">+ {s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button className="flex-1 btn-primary py-2.5 shadow-md">Apply Now</button>
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="bg-gray-50 p-6 border-t border-gray-100 text-sm text-gray-600 animate-slide-up">
          <h4 className="font-bold text-gray-900 mb-2">Job Description Summary</h4>
          <p className="mb-4 text-gray-600 leading-relaxed">
            This is an automatically parsed summary of the role. You are expected to have minimum {job.experience || '2'} years of professional experience...
            (Mock description based on extracted title: {job.title}).
          </p>
          <p className="text-xs text-gray-400">Scraped at: {new Date(job.timestamp || job.scrapedAt || Date.now()).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
