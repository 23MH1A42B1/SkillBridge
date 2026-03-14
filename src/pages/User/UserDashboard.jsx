import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

const TABS = [
  { key: 'overview', label: 'Dashboard', icon: 'Home' },
  { key: 'resume', label: 'Resume Upload', icon: 'Resume' },
  { key: 'skills', label: 'Skill Profile', icon: 'Skills' },
  { key: 'jobs', label: 'Live Job Feed', icon: 'Jobs' },
  { key: 'matches', label: 'Job Matches', icon: 'Match' },
  { key: 'skillgap', label: 'Skill Gap Advisor', icon: 'Gap' },
  { key: 'emailprefs', label: 'Email Preferences', icon: 'Email' },
  { key: 'powerbi', label: 'My Power BI', icon: 'PBI' },
  { key: 'saved', label: 'Saved Jobs', icon: 'Saved' },
  { key: 'notifs', label: 'Notifications', icon: 'Notif' },
];

const sourceBadge = (source) => {
  const map = {
    LinkedIn: 'bg-blue-900/40 border border-blue-700 text-blue-300',
    Naukri: 'bg-orange-900/40 border border-orange-700 text-orange-300',
    Indeed: 'bg-indigo-900/40 border border-indigo-700 text-indigo-300',
    'Google Jobs': 'bg-green-900/40 border border-green-700 text-green-300',
    Shine: 'bg-purple-900/40 border border-purple-700 text-purple-300',
    Glassdoor: 'bg-teal-900/40 border border-teal-700 text-teal-300',
  };
  return map[source] || 'bg-slate-700 border border-slate-600 text-slate-300';
};

const scoreBadge = (score) => {
  if (score >= 85) return 'bg-emerald-900/40 border border-emerald-700 text-emerald-400';
  if (score >= 70) return 'bg-yellow-900/40 border border-yellow-700 text-yellow-400';
  return 'bg-orange-900/40 border border-orange-700 text-orange-400';
};

export default function UserDashboard() {
  const {
    currentUser, liveJobs, skillGapData,
    getUserSkills, getUserMatches, getUserNotifications, getUserSavedJobs,
    getUserEmailPrefs, getJobByID, saveJob, updateSavedJobStatus, removeSavedJob,
    markNotificationRead, markAllNotificationsRead, updateEmailPrefs, updateUserSkills,
  } = useApp();

  const [tab, setTab] = useState('overview');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [pbiUrl, setPbiUrl] = useState('');
  const [showPbi, setShowPbi] = useState(false);

  const uid = currentUser?.UserID;
  const skills = useMemo(() => getUserSkills(uid), [getUserSkills, uid]);
  const matches = useMemo(() => getUserMatches(uid), [getUserMatches, uid]);
  const notifs = useMemo(() => getUserNotifications(uid), [getUserNotifications, uid]);
  const saved = useMemo(() => getUserSavedJobs(uid), [getUserSavedJobs, uid]);
  const emailPrefs = useMemo(() => getUserEmailPrefs(uid), [getUserEmailPrefs, uid]);

  const unreadCount = notifs.filter((n) => !n.Read).length;
  const topMatches = useMemo(() => {
    return matches
      .map((m) => ({ ...m, job: getJobByID(m.JobID) }))
      .filter((m) => m.job)
      .sort((a, b) => b.OverallMatchScore - a.OverallMatchScore);
  }, [matches, getJobByID]);

  const handleParse = () => {
    if (!resumeText.trim() && !resumeFile) return;
    setParsing(true);
    setTimeout(() => {
      updateUserSkills(uid, {
        TechnicalSkills: ['React', 'JavaScript', 'Node.js', 'Python', 'SQL'],
        SoftSkills: ['Communication', 'Problem Solving'],
        Tools: ['Git', 'VS Code', 'Docker'],
        Certifications: ['AWS Certified Developer'],
        ProfileScore: 82,
        ProfileSummary: 'AI-parsed profile from uploaded resume. Skills extracted and scored.',
        IsProfileComplete: true,
      });
      setParsing(false);
      setResumeText('');
      setResumeFile(null);
    }, 2000);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setResumeFile(file);
    }
  };

  const missingSkillsAgg = useMemo(() => {
    const map = {};
    matches.forEach((m) => m.MissingSkills.forEach((s) => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [matches]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-60 border-r border-slate-800 bg-slate-900">
        <div className="px-4 py-6">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white">{currentUser?.Name?.charAt(0) || 'U'}</div>
          <p className="text-center text-sm font-semibold text-white">{currentUser?.Name}</p>
          <p className="mb-4 text-center text-xs text-slate-400">{currentUser?.DesiredRole || 'Candidate'}</p>
          <div className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${tab === t.key ? 'border border-blue-800 bg-blue-900/40 text-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                onClick={() => setTab(t.key)}
              >
                <span className="text-xs uppercase">{t.icon}</span>
                <span>{t.label}</span>
                {t.key === 'notifs' && unreadCount > 0 && <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="ml-60 space-y-6 px-6 py-6">
        {tab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {currentUser?.Name?.split(' ')[0]}</h2>
            <p className="mt-1 text-sm text-slate-400">Your personalized placement dashboard</p>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {[
                { label: 'Profile Score', value: skills?.ProfileScore || '-', color: 'text-blue-400' },
                { label: 'Job Matches', value: matches.length, color: 'text-emerald-400' },
                { label: 'Best Match', value: topMatches[0] ? `${topMatches[0].OverallMatchScore}%` : '-', color: 'text-violet-400' },
                { label: 'Saved Jobs', value: saved.length, color: 'text-amber-400' },
                { label: 'Unread Alerts', value: unreadCount, color: 'text-orange-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200">
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {topMatches.slice(0, 5).map((m) => (
                <div key={m.MatchID} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-600">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white">{m.job.Company?.charAt(0)}</div>
                      <div>
                        <div className="text-base font-semibold text-white">{m.job.Title}</div>
                        <div className="text-sm text-slate-400">{m.job.Company} | {m.job.Location}</div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadge(m.OverallMatchScore)}`}>{m.OverallMatchScore}%</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.MatchedSkills.map((s) => <span key={s} className="rounded-full border border-emerald-700 bg-emerald-900/40 px-2.5 py-0.5 text-xs text-emerald-300">{s}</span>)}
                    {m.MissingSkills.map((s) => <span key={s} className="rounded-full border border-red-700 bg-red-900/40 px-2.5 py-0.5 text-xs text-red-300">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'resume' && (
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Resume Upload</h2>
            <p className="mt-1 text-sm text-slate-400">Upload PDF or DOCX. AI will parse your skills and profile.</p>
            <div className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${resumeFile ? 'border-emerald-600 bg-emerald-900/10' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50'}`} onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()} onClick={() => document.getElementById('resume-input')?.click()}>
              <input id="resume-input" type="file" accept=".pdf,.docx" hidden onChange={handleFileDrop} />
              {resumeFile ? <p className="text-sm text-emerald-300">{resumeFile.name}</p> : <p className="text-sm text-slate-400">Drop resume here or click to browse</p>}
            </div>
            <div className="relative my-4 text-center text-xs text-slate-500"><span className="bg-slate-800 px-3">OR</span></div>
            <textarea className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:border-blue-500" rows={8} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume text here" />
            <button className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50" onClick={handleParse} disabled={parsing || (!resumeText.trim() && !resumeFile)}>{parsing ? 'Parsing...' : 'Parse with AI'}</button>
            {skills?.IsProfileComplete && <div className="mt-4 rounded-lg border border-emerald-700 bg-emerald-900/20 p-3 text-sm text-emerald-300">Profile parsed successfully</div>}
          </div>
        )}

        {tab === 'skills' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">My Skill Profile</h2>
              {skills ? (
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
                    <svg viewBox="0 0 120 120" className="mx-auto h-36 w-36">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray={`${(skills.ProfileScore || 0) * 3.14} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                      <text x="60" y="56" textAnchor="middle" className="fill-slate-100 text-xl font-bold">{skills.ProfileScore || 0}</text>
                      <text x="60" y="72" textAnchor="middle" className="fill-slate-400 text-[8px]">/100</text>
                    </svg>
                    <p className="mt-3 text-sm text-slate-400">{skills.ProfileSummary}</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">{skills.SuggestedRoles?.map((r) => <span key={r} className="rounded-full border border-blue-700 bg-blue-900/40 px-3 py-1 text-xs text-blue-300">{r}</span>)}</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Technical Skills', items: skills.TechnicalSkills, cls: 'bg-blue-900/40 border-blue-700 text-blue-300' },
                      { label: 'Soft Skills', items: skills.SoftSkills, cls: 'bg-purple-900/40 border-purple-700 text-purple-300' },
                      { label: 'Tools', items: skills.Tools, cls: 'bg-emerald-900/40 border-emerald-700 text-emerald-300' },
                      { label: 'Certifications', items: skills.Certifications, cls: 'bg-amber-900/40 border-amber-700 text-amber-300' },
                    ].map((cat) => (
                      <div key={cat.label} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                        <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">{cat.label}</p>
                        <div className="flex flex-wrap gap-1.5">{cat.items?.map((s) => <span key={s} className={`rounded-full border px-2.5 py-0.5 text-xs ${cat.cls}`}>{s}</span>)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="mt-3 text-sm text-slate-400">Upload your resume to generate skill profile.</p>}
            </div>
          </div>
        )}

        {tab === 'jobs' && (
          <div className="space-y-4">
            {liveJobs.filter((j) => j.IsActive).map((job) => {
              const match = matches.find((m) => m.JobID === job.JobID);
              const isSaved = saved.some((s) => s.JobID === job.JobID);
              return (
                <div key={job.JobID} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-blue-700/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white">{job.Company?.charAt(0)}</div>
                      <div>
                        <div className="text-base font-semibold text-white">{job.Title}</div>
                        <div className="text-sm text-slate-400">{job.Company} | {job.Location} | {job.WorkMode}</div>
                      </div>
                    </div>
                    {match && <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadge(match.OverallMatchScore)}`}>{match.OverallMatchScore}%</span>}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{job.JobDescription}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.RequiredSkills.map((s) => {
                      const has = skills?.TechnicalSkills?.includes(s) || skills?.Tools?.includes(s);
                      return <span key={s} className={`rounded-full border px-2.5 py-0.5 text-xs ${has ? 'border-emerald-700 bg-emerald-900/40 text-emerald-300' : 'border-red-700 bg-red-900/40 text-red-300'}`}>{s}</span>;
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${sourceBadge(job.Source)}`}>{job.Source}</span>
                    <span className="text-sm text-emerald-400">{job.Salary}</span>
                    <span className="rounded-full border border-slate-600 bg-slate-700 px-2.5 py-0.5 text-xs text-slate-300">{job.JobType}</span>
                    <div className="ml-auto flex gap-2">
                      <button className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${isSaved ? 'bg-slate-700 text-slate-300' : 'border border-slate-600 text-slate-300 hover:bg-slate-700'}`} onClick={() => !isSaved && saveJob(uid, job.JobID)}>{isSaved ? 'Saved' : 'Save'}</button>
                      <a href={job.ApplyURL} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-blue-500">Apply Now</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'matches' && (
          <div className="space-y-4">
            {topMatches.map((m) => (
              <div key={m.MatchID} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-semibold text-white">{m.job.Title}</div>
                    <div className="text-sm text-slate-400">{m.job.Company} | {m.job.Location}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadge(m.OverallMatchScore)}`}>{m.OverallMatchScore}%</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">{m.Verdict}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div><p className="mb-1 text-xs text-emerald-300">Matched</p><div className="flex flex-wrap gap-1">{m.MatchedSkills.map((s) => <span key={s} className="rounded-full border border-emerald-700 bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">{s}</span>)}</div></div>
                  <div><p className="mb-1 text-xs text-red-300">Missing</p><div className="flex flex-wrap gap-1">{m.MissingSkills.map((s) => <span key={s} className="rounded-full border border-red-700 bg-red-900/40 px-2 py-0.5 text-xs text-red-300">{s}</span>)}</div></div>
                  <div><p className="mb-1 text-xs text-yellow-300">Bonus</p><div className="flex flex-wrap gap-1">{m.BonusSkills?.map((s) => <span key={s} className="rounded-full border border-yellow-700 bg-yellow-900/40 px-2 py-0.5 text-xs text-yellow-300">{s}</span>)}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'skillgap' && (
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4"><div className="text-2xl font-bold text-blue-400">{missingSkillsAgg.length}</div><div className="text-xs text-slate-400">Skill Gaps Found</div></div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4"><div className="text-2xl font-bold text-yellow-400">{missingSkillsAgg[0]?.[0] || '-'}</div><div className="text-xs text-slate-400">Top Priority Skill</div></div>
            </div>
            <div className="mt-4 space-y-3">
              {missingSkillsAgg.map(([skill, count]) => {
                const demand = skillGapData.find((s) => s.SkillName === skill);
                return (
                  <div key={skill} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-white">{skill}</div>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${count >= 2 ? 'bg-red-900/40 border border-red-700 text-red-300' : 'bg-yellow-900/40 border border-yellow-700 text-yellow-300'}`}>{count >= 2 ? 'Critical' : 'Important'}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Missing in {count} matched job{count > 1 ? 's' : ''}{demand ? ` | demand ${demand.DemandCount}` : ''}</div>
                    <div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full border border-blue-700 bg-blue-900/40 px-2.5 py-0.5 text-xs text-blue-300">Udemy</span><span className="rounded-full border border-violet-700 bg-violet-900/40 px-2.5 py-0.5 text-xs text-violet-300">Coursera</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'emailprefs' && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">Alert Frequency</label>
              <select className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={emailPrefs.AlertFrequency} onChange={(e) => updateEmailPrefs(uid, { AlertFrequency: e.target.value })}>
                <option value="instant">Instant</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">Minimum Match %</label>
              <input type="number" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={emailPrefs.MinMatchPercent} onChange={(e) => updateEmailPrefs(uid, { MinMatchPercent: parseInt(e.target.value, 10) || 60 })} min="0" max="100" />
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <label className="mb-2 block text-sm font-medium text-slate-300">Opt In</label>
              <button className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${emailPrefs.OptIn ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-red-600 text-white hover:bg-red-500'}`} onClick={() => updateEmailPrefs(uid, { OptIn: !emailPrefs.OptIn })}>{emailPrefs.OptIn ? 'Subscribed' : 'Unsubscribed'}</button>
            </div>
          </div>
        )}

        {tab === 'powerbi' && (
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
            <h2 className="text-xl font-semibold text-white">My Dashboard</h2>
            {showPbi && pbiUrl ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700"><iframe className="h-screen w-full" src={pbiUrl} title="My Power BI" allowFullScreen /></div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-6 text-center">
                <p className="text-sm text-slate-400">Embed your Power BI dashboard URL</p>
                <div className="mx-auto mt-3 flex max-w-xl gap-2">
                  <input type="text" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={pbiUrl} onChange={(e) => setPbiUrl(e.target.value)} placeholder="https://app.powerbi.com/view?r=..." />
                  <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500" onClick={() => pbiUrl.trim() && setShowPbi(true)}>Embed</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div className="space-y-3">
            {saved.map((s) => {
              const job = getJobByID(s.JobID);
              if (!job) return null;
              const statusClass = s.Status === 'Applied' ? 'bg-blue-900/40 border border-blue-700 text-blue-300' : s.Status === 'Interviewing' ? 'bg-yellow-900/40 border border-yellow-700 text-yellow-300' : s.Status === 'Offered' ? 'bg-emerald-900/40 border border-emerald-700 text-emerald-300' : s.Status === 'Rejected' ? 'bg-red-900/40 border border-red-700 text-red-300' : 'bg-slate-700 border border-slate-600 text-slate-300';
              return (
                <div key={s.JobID} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><div className="font-semibold text-white">{job.Title}</div><div className="text-sm text-slate-400">{job.Company} | {job.Location}</div></div>
                    <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={s.Status} onChange={(e) => updateSavedJobStatus(uid, s.JobID, e.target.value)}><option value="Saved">Saved</option><option value="Applied">Applied</option><option value="Interviewing">Interviewing</option><option value="Offered">Offered</option><option value="Rejected">Rejected</option></select>
                  </div>
                  <div className="mt-3 flex items-center justify-between"><span className={`rounded-full px-2.5 py-0.5 text-xs ${statusClass}`}>{s.Status}</span><button className="rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 transition-all duration-200 hover:bg-red-900/20 hover:text-red-300" onClick={() => removeSavedJob(uid, s.JobID)}>Remove</button></div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'notifs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between"><p className="text-sm text-slate-400">{unreadCount} unread notifications</p>{unreadCount > 0 && <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-all duration-200 hover:bg-slate-800" onClick={() => markAllNotificationsRead(uid)}>Mark All Read</button>}</div>
            {notifs.map((n) => (
              <div key={n.NotifID} className={`flex items-start gap-3 rounded-xl border p-4 transition-all duration-200 ${n.Read ? 'border-slate-700 bg-slate-800/50 opacity-70' : 'border-blue-800/40 border-l-4 border-l-blue-500 bg-slate-800'}`} onClick={() => !n.Read && markNotificationRead(n.NotifID)}>
                <span className="text-lg">{n.Type === 'match' ? 'M' : n.Type === 'resume' ? 'R' : n.Type === 'skillgap' ? 'G' : 'N'}</span>
                <div className="flex-1"><div className="text-sm text-slate-200">{n.Message}</div><div className="mt-1 text-xs text-slate-500">{new Date(n.Timestamp).toLocaleString()}</div></div>
                {!n.Read && <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
