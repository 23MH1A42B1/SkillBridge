import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

const TABS = [
  { key: 'overview', label: 'KPI Dashboard', icon: 'KPI' },
  { key: 'users', label: 'User Management', icon: 'USR' },
  { key: 'jobs', label: 'Job Monitor', icon: 'JOB' },
  { key: 'matches', label: 'Match Results', icon: 'MAT' },
  { key: 'emails', label: 'Email Logs', icon: 'EML' },
  { key: 'powerbi', label: 'Power BI Analytics', icon: 'PBI' },
  { key: 'scraper', label: 'Scraper Control', icon: 'BOT' },
  { key: 'skillgap', label: 'Skill Gap Report', icon: 'GAP' },
  { key: 'settings', label: 'Settings', icon: 'CFG' },
  { key: 'audit', label: 'Audit Log', icon: 'LOG' },
];

const tableHead = 'border-b border-slate-700 bg-slate-900 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400';
const tableCell = 'px-4 py-3 text-sm text-slate-300';
const rowCls = 'border-b border-slate-800 transition-colors hover:bg-slate-700/30';

export default function AdminDashboard() {
  const {
    users, userSkillsList, liveJobs, matchResultsList, emailLogsList,
    settings, skillGapData, auditLogList, updateSettings, getStats,
  } = useApp();

  const [tab, setTab] = useState('overview');
  const [pbiUrl, setPbiUrl] = useState('');
  const [showPbi, setShowPbi] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState(null);

  const stats = useMemo(() => getStats(), [getStats]);

  const sourceCounts = useMemo(() => {
    const map = {};
    liveJobs.forEach((j) => { map[j.Source] = (map[j.Source] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [liveJobs]);

  const topSkills = useMemo(() => {
    const map = {};
    liveJobs.forEach((j) => j.RequiredSkills.forEach((s) => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [liveJobs]);

  const handleScrape = () => {
    setScrapeStatus('running');
    setTimeout(() => setScrapeStatus('done'), 2000);
  };

  const sourceBadge = (source) => {
    const map = {
      LinkedIn: 'bg-blue-900/40 border border-blue-700 text-blue-300',
      Naukri: 'bg-orange-900/40 border border-orange-700 text-orange-300',
      Indeed: 'bg-indigo-900/40 border border-indigo-700 text-indigo-300',
      'Google Jobs': 'bg-green-900/40 border border-green-700 text-green-300',
      Shine: 'bg-purple-900/40 border border-purple-700 text-purple-300',
      Glassdoor: 'bg-teal-900/40 border border-teal-700 text-teal-300',
    };
    return map[source] || 'bg-slate-800 border border-slate-700 text-slate-300';
  };

  const scoreBadge = (score) => {
    if (score >= 85) return 'bg-emerald-900/40 border border-emerald-700 text-emerald-400';
    if (score >= 70) return 'bg-yellow-900/40 border border-yellow-700 text-yellow-400';
    return 'bg-orange-900/40 border border-orange-700 text-orange-400';
  };

  const statusBadge = (value) => {
    const status = (value || '').toLowerCase();
    if (['active', 'sent', 'success', 'running', 'connected', 'embedded'].includes(status)) {
      return 'bg-emerald-900/40 border border-emerald-700 text-emerald-300';
    }
    if (['pending', 'warning', 'not configured'].includes(status)) {
      return 'bg-yellow-900/40 border border-yellow-700 text-yellow-300';
    }
    return 'bg-red-900/40 border border-red-700 text-red-300';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-4 py-4">
          <p className="text-sm font-bold text-white">Admin Portal</p>
          <p className="text-xs text-slate-500">SkillBridge</p>
        </div>
        <div className="mt-2 space-y-1 px-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? 'border border-blue-800 bg-blue-900/40 text-blue-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setTab(t.key)}
            >
              <span className="text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="ml-64 min-h-screen bg-slate-900">
        <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
          <h1 className="text-lg font-semibold text-white">{TABS.find((t) => t.key === tab)?.label}</h1>
          <p className="text-sm text-slate-400">Operational analytics, controls, and governance</p>
        </header>

        <div className="space-y-6 px-6 py-6">
          {tab === 'overview' && (
            <div>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: 'USR', color: 'text-blue-400', iconBg: 'bg-blue-900/40' },
                  { label: 'Resumes Uploaded', value: stats.resumesUploaded, icon: 'CV', color: 'text-emerald-400', iconBg: 'bg-emerald-900/40' },
                  { label: 'Jobs Scraped', value: stats.activeJobs, icon: 'JOB', color: 'text-violet-400', iconBg: 'bg-violet-900/40' },
                  { label: 'Emails Sent', value: stats.emailsSent, icon: 'EML', color: 'text-amber-400', iconBg: 'bg-amber-900/40' },
                  { label: 'Avg Match Score', value: `${stats.avgMatchScore}%`, icon: 'MAT', color: 'text-blue-400', iconBg: 'bg-blue-900/40' },
                  { label: 'Placement Rate', value: `${stats.placementRate}%`, icon: 'HIRE', color: 'text-emerald-400', iconBg: 'bg-emerald-900/40' },
                ].map((k, i) => (
                  <div key={i} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${k.iconBg} text-xl`}>{k.icon}</div>
                    <div className={`mt-1 text-3xl font-bold ${k.color}`}>{k.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">{k.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                  <h3 className="mb-4 text-base font-semibold text-white">Top In-Demand Skills</h3>
                  <div className="space-y-2">
                    {topSkills.map(([skill, count]) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-sm text-slate-300">{skill}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-200" style={{ width: `${(count / topSkills[0][1]) * 100}%` }} />
                        </div>
                        <span className="w-6 text-right text-xs text-slate-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                  <h3 className="mb-4 text-base font-semibold text-white">Jobs by Source Portal</h3>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse">
                      <thead><tr><th className={tableHead}>Portal</th><th className={tableHead}>Jobs</th><th className={tableHead}>%</th></tr></thead>
                      <tbody>
                        {sourceCounts.map(([src, cnt]) => (
                          <tr key={src} className={rowCls}>
                            <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs ${sourceBadge(src)}`}>{src}</span></td>
                            <td className={tableCell}>{cnt}</td>
                            <td className={tableCell}>{Math.round((cnt / liveJobs.length) * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">User Management</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">All registered candidates with skill and placement data</p>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead><tr><th className={tableHead}>Name</th><th className={tableHead}>Email</th><th className={tableHead}>College</th><th className={tableHead}>Desired Role</th><th className={tableHead}>Score</th><th className={tableHead}>Status</th></tr></thead>
                  <tbody>
                    {users.map((u) => {
                      const sk = userSkillsList.find((s) => s.UserID === u.UserID);
                      return (
                        <tr key={u.UserID} className={rowCls}>
                          <td className={`${tableCell} font-medium text-slate-100`}>{u.Name}</td>
                          <td className={`${tableCell} font-mono text-xs text-slate-400`}>{u.Email}</td>
                          <td className={tableCell}>{u.College}</td>
                          <td className={tableCell}>{u.DesiredRole}</td>
                          <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadge(sk?.ProfileScore || 0)}`}>{sk?.ProfileScore || '-'}</span></td>
                          <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs ${statusBadge(u.Status)}`}>{u.Status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Job Monitor</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">Real-time view of all scraped jobs across platforms</p>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead><tr><th className={tableHead}>Title</th><th className={tableHead}>Company</th><th className={tableHead}>Source</th><th className={tableHead}>Location</th><th className={tableHead}>Type</th><th className={tableHead}>Salary</th><th className={tableHead}>Active</th></tr></thead>
                  <tbody>
                    {liveJobs.map((j) => (
                      <tr key={j.JobID} className={rowCls}>
                        <td className={`${tableCell} font-medium text-slate-100`}>{j.Title}</td>
                        <td className={tableCell}>{j.Company}</td>
                        <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs ${sourceBadge(j.Source)}`}>{j.Source}</span></td>
                        <td className={tableCell}>{j.Location}</td>
                        <td className={tableCell}>{j.JobType}</td>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{j.Salary}</td>
                        <td className={tableCell}>{j.IsActive ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'matches' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Match Results</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">AI-generated match scores per user per job</p>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead><tr><th className={tableHead}>User</th><th className={tableHead}>Job</th><th className={tableHead}>Score</th><th className={tableHead}>Verdict</th><th className={tableHead}>Matched</th><th className={tableHead}>Missing</th><th className={tableHead}>Email</th></tr></thead>
                  <tbody>
                    {matchResultsList.map((m) => {
                      const user = users.find((u) => u.UserID === m.UserID);
                      const job = liveJobs.find((j) => j.JobID === m.JobID);
                      return (
                        <tr key={m.MatchID} className={rowCls}>
                          <td className={tableCell}>{user?.Name || m.UserID}</td>
                          <td className={tableCell}>{job?.Title || m.JobID}<br /><span className="text-xs text-slate-400">{job?.Company}</span></td>
                          <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadge(m.OverallMatchScore)}`}>{m.OverallMatchScore}%</span></td>
                          <td className={`${tableCell} font-mono text-xs text-slate-400`}>{m.Verdict}</td>
                          <td className={tableCell}><div className="flex flex-wrap gap-1">{m.MatchedSkills.map((s) => <span key={s} className="rounded-full border border-emerald-700 bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">{s}</span>)}</div></td>
                          <td className={tableCell}><div className="flex flex-wrap gap-1">{m.MissingSkills.map((s) => <span key={s} className="rounded-full border border-red-700 bg-red-900/40 px-2 py-0.5 text-xs text-red-300">{s}</span>)}</div></td>
                          <td className={tableCell}>{m.EmailSent ? 'Sent' : 'Pending'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'emails' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Email Logs</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">Full history of every job alert email sent via Outlook</p>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead><tr><th className={tableHead}>Recipient</th><th className={tableHead}>Subject</th><th className={tableHead}>Jobs</th><th className={tableHead}>Time</th><th className={tableHead}>Template</th><th className={tableHead}>Status</th></tr></thead>
                  <tbody>
                    {emailLogsList.map((e) => (
                      <tr key={e.EmailID} className={rowCls}>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{e.RecipientEmail}</td>
                        <td className={tableCell}>{e.Subject}</td>
                        <td className={tableCell}>{e.JobsIncluded.length}</td>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{new Date(e.Timestamp).toLocaleString()}</td>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{e.Template}</td>
                        <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs ${statusBadge(e.DeliveryStatus)}`}>{e.DeliveryStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'powerbi' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Power BI Analytics</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">Embedded 8-page Power BI report connected to SharePoint</p>
              {showPbi && pbiUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                    <span>Power BI Report</span>
                    <button className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 transition-all duration-200 hover:bg-slate-800" onClick={() => setShowPbi(false)}>Close</button>
                  </div>
                  <iframe className="h-screen w-full" src={pbiUrl} title="Power BI" allowFullScreen />
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-10 text-center">
                  <div className="text-4xl">PBI</div>
                  <h3 className="mt-3 text-lg font-semibold text-white">Embed Power BI Report</h3>
                  <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-400">8 admin report pages: Overview, User Analytics, Job Market, Match Results, Email Performance, Skill Gap Heatmap, Placement Trends, System Health</p>
                  <div className="mx-auto mt-5 flex max-w-2xl gap-2">
                    <input type="text" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition-all duration-200 focus:border-blue-500" placeholder="https://app.powerbi.com/view?r=..." value={pbiUrl} onChange={(e) => setPbiUrl(e.target.value)} />
                    <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => pbiUrl.trim() && setShowPbi(true)} disabled={!pbiUrl.trim()}>Embed</button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {['Overview Home', 'User Analytics', 'Job Market View', 'Match Results', 'Email Performance', 'Skill Gap Heatmap', 'Placement Trends', 'System Health'].map((p) => (
                      <span key={p} className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'scraper' && (
            <div>
              <h2 className="text-xl font-semibold text-white">Scraper Control Panel</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">Manage job scraping schedule and trigger manual runs</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                  <h3 className="text-base font-semibold text-white">Manual Trigger</h3>
                  <p className="mt-1 text-sm text-slate-400">Run a full scrape cycle across all enabled portals now.</p>
                  <button className="mt-4 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 disabled:opacity-50" onClick={handleScrape} disabled={scrapeStatus === 'running'}>
                    {scrapeStatus === 'running' ? 'Scraping...' : scrapeStatus === 'done' ? 'Completed' : 'Run Scrape Now'}
                  </button>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <div><span className="text-slate-500">Last Run:</span> {auditLogList.find((a) => a.FlowName === 'F2-JobScraper')?.Timestamp ? new Date(auditLogList.find((a) => a.FlowName === 'F2-JobScraper').Timestamp).toLocaleString() : '-'}</div>
                    <div><span className="text-slate-500">Schedule:</span> Every {settings.ScrapeInterval} hours</div>
                    <div><span className="text-slate-500">Total Jobs:</span> {liveJobs.length}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                  <h3 className="text-base font-semibold text-white">Enabled Portals</h3>
                  <div className="mt-3 space-y-2">
                    {['LinkedIn', 'Naukri', 'Indeed', 'Google Jobs', 'Shine', 'Glassdoor'].map((p) => (
                      <div key={p} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs ${sourceBadge(p)}`}>{p}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${settings.EnabledPortals.includes(p) ? 'bg-emerald-900/40 border border-emerald-700 text-emerald-300' : 'bg-slate-700 border border-slate-600 text-slate-300'}`}>{settings.EnabledPortals.includes(p) ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                <h3 className="mb-4 text-base font-semibold text-white">Recent Scrape Logs</h3>
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead><tr><th className={tableHead}>Time</th><th className={tableHead}>Action</th><th className={tableHead}>Result</th><th className={tableHead}>Duration</th><th className={tableHead}>Error</th></tr></thead>
                    <tbody>
                      {auditLogList.filter((a) => a.FlowName === 'F2-JobScraper').map((a) => (
                        <tr key={a.LogID} className={rowCls}>
                          <td className={`${tableCell} font-mono text-xs text-slate-400`}>{new Date(a.Timestamp).toLocaleString()}</td>
                          <td className={tableCell}>{a.Action}</td>
                          <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs ${statusBadge(a.Result)}`}>{a.Result}</span></td>
                          <td className={`${tableCell} font-mono text-xs text-slate-400`}>{a.Duration}</td>
                          <td className={tableCell}>{a.ErrorText || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'skillgap' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Skill Gap Report</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">Aggregate view: market demand vs. candidate skill gaps</p>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead><tr><th className={tableHead}>Skill</th><th className={tableHead}>Market Demand</th><th className={tableHead}>Gap Count</th><th className={tableHead}>Gap %</th><th className={tableHead}>Trend</th></tr></thead>
                  <tbody>
                    {skillGapData.sort((a, b) => b.GapCount - a.GapCount).map((s) => (
                      <tr key={s.SkillName} className={rowCls}>
                        <td className={`${tableCell} font-medium text-slate-100`}>{s.SkillName}</td>
                        <td className={tableCell}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(s.DemandCount / 60) * 100}%` }} /></div>
                            <span className="text-xs text-slate-400">{s.DemandCount}</span>
                          </div>
                        </td>
                        <td className={tableCell}><span className="rounded-full bg-yellow-900/40 border border-yellow-700 px-2.5 py-0.5 text-xs text-yellow-300">{s.GapCount}</span></td>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{Math.round((s.GapCount / Math.max(s.DemandCount, 1)) * 100)}%</td>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{s.TrendWeek}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">Configure platform-wide settings for scraping, matching, and emails</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Scrape Interval (hours)</label>
                  <input type="number" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" value={settings.ScrapeInterval} onChange={(e) => updateSettings({ ScrapeInterval: parseInt(e.target.value, 10) || 6 })} min="1" max="24" />
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Min Match % Threshold</label>
                  <input type="number" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" value={settings.MinMatchPercent} onChange={(e) => updateSettings({ MinMatchPercent: parseInt(e.target.value, 10) || 60 })} min="0" max="100" />
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email Frequency</label>
                  <select className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" value={settings.EmailFrequency} onChange={(e) => updateSettings({ EmailFrequency: e.target.value })}>
                    <option value="instant">Instant</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Portal Status</label>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${settings.PortalEnabled ? statusBadge('active') : statusBadge('error')}`}>{settings.PortalEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
                <h3 className="mb-4 text-base font-semibold text-white">Integration Status</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { name: 'SharePoint Online', icon: 'SP', status: 'Connected', desc: 'Resume and data storage' },
                    { name: 'Power BI', icon: 'BI', status: showPbi ? 'Embedded' : 'Not Configured', desc: '8-page dashboard' },
                    { name: 'Power Automate', icon: 'PA', status: 'Connected', desc: '6 cloud flows' },
                    { name: 'Claude AI / Azure OpenAI', icon: 'AI', status: 'Connected', desc: 'Resume parse and skill match' },
                    { name: 'Python Scraper + Azure Function', icon: 'PY', status: 'Running', desc: 'Job scraping engine' },
                    { name: 'Outlook 365', icon: 'OL', status: 'Connected', desc: 'Email dispatch' },
                    { name: 'Microsoft Entra ID', icon: 'ID', status: 'Active', desc: 'SSO + RBAC' },
                  ].map((s) => (
                    <div key={s.name} className="flex gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{s.name}</div>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs ${statusBadge(s.status)}`}>{s.status}</span>
                        <div className="mt-2 text-xs text-slate-500">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'audit' && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Audit Log</h2>
              <p className="mb-4 mt-1 text-sm text-slate-400">Every system action logged with actor, timestamp, and result</p>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead><tr><th className={tableHead}>Time</th><th className={tableHead}>Flow</th><th className={tableHead}>Action</th><th className={tableHead}>Actor</th><th className={tableHead}>Result</th><th className={tableHead}>Duration</th><th className={tableHead}>Error</th></tr></thead>
                  <tbody>
                    {auditLogList.map((a) => (
                      <tr key={a.LogID} className={rowCls}>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{new Date(a.Timestamp).toLocaleString()}</td>
                        <td className={tableCell}><span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">{a.FlowName}</span></td>
                        <td className={tableCell}>{a.Action}</td>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{a.Actor}</td>
                        <td className={tableCell}><span className={`rounded-full px-2.5 py-0.5 text-xs ${statusBadge(a.Result)}`}>{a.Result}</span></td>
                        <td className={`${tableCell} font-mono text-xs text-slate-400`}>{a.Duration}</td>
                        <td className={`${tableCell} ${a.ErrorText ? 'text-red-300' : 'text-slate-500'}`}>{a.ErrorText || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
