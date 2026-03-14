import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './Admin.css';

const TABS = [
  { key: 'overview', label: 'KPI Dashboard', icon: '📊' },
  { key: 'users', label: 'User Management', icon: '👥' },
  { key: 'jobs', label: 'Job Monitor', icon: '💼' },
  { key: 'matches', label: 'Match Results', icon: '🎯' },
  { key: 'emails', label: 'Email Logs', icon: '✉️' },
  { key: 'powerbi', label: 'Power BI Analytics', icon: '📈' },
  { key: 'scraper', label: 'Scraper Control', icon: '🔍' },
  { key: 'skillgap', label: 'Skill Gap Report', icon: '📉' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
  { key: 'audit', label: 'Audit Log', icon: '📋' },
];

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
    liveJobs.forEach(j => { map[j.Source] = (map[j.Source] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [liveJobs]);

  const topSkills = useMemo(() => {
    const map = {};
    liveJobs.forEach(j => j.RequiredSkills.forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [liveJobs]);

  const handleScrape = () => {
    setScrapeStatus('running');
    setTimeout(() => setScrapeStatus('done'), 2000);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-title">Admin Portal</div>
        {TABS.map(t => (
          <button key={t.key} className={`sidebar-item ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            <span className="sidebar-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </aside>

      <main className="admin-main">
        {/* ─── Overview ──────────────────── */}
        {tab === 'overview' && (
          <div className="admin-panel">
            <h2>Live KPI Dashboard</h2>
            <div className="kpi-grid">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👨‍🎓', color: 'var(--cyan)' },
                { label: 'Resumes Uploaded', value: stats.resumesUploaded, icon: '📄', color: 'var(--green)' },
                { label: 'Jobs Scraped', value: stats.activeJobs, icon: '💼', color: 'var(--violet2)' },
                { label: 'Emails Sent', value: stats.emailsSent, icon: '✉️', color: 'var(--orange)' },
                { label: 'Avg Match Score', value: `${stats.avgMatchScore}%`, icon: '🎯', color: 'var(--cyan)' },
                { label: 'Active Jobs', value: stats.activeJobs, icon: '🌐', color: 'var(--green)' },
              ].map((k, i) => (
                <div key={i} className="kpi-card" style={{ '--accent': k.color }}>
                  <span className="kpi-icon">{k.icon}</span>
                  <div className="kpi-value">{k.value}</div>
                  <div className="kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="admin-row">
              <div className="admin-card">
                <h3>Top In-Demand Skills</h3>
                <div className="bar-chart">
                  {topSkills.map(([skill, count]) => (
                    <div key={skill} className="bar-row">
                      <span className="bar-label">{skill}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(count / topSkills[0][1]) * 100}%` }}>
                          <span className="bar-val">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card">
                <h3>Jobs by Source Portal</h3>
                <table className="admin-table">
                  <thead><tr><th>Portal</th><th>Jobs</th><th>%</th></tr></thead>
                  <tbody>
                    {sourceCounts.map(([src, cnt]) => (
                      <tr key={src}>
                        <td><span className={`source-badge src-${src.toLowerCase().replace(/\s/g, '')}`}>{src}</span></td>
                        <td>{cnt}</td>
                        <td>{Math.round(cnt / liveJobs.length * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── User Management ───────────── */}
        {tab === 'users' && (
          <div className="admin-panel">
            <h2>User Management</h2>
            <p className="panel-desc">All registered candidates with skill and placement data</p>
            <table className="admin-table full">
              <thead>
                <tr><th>Name</th><th>Email</th><th>College</th><th>Desired Role</th><th>Score</th><th>Status</th></tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const sk = userSkillsList.find(s => s.UserID === u.UserID);
                  return (
                    <tr key={u.UserID}>
                      <td><strong>{u.Name}</strong></td>
                      <td className="mono">{u.Email}</td>
                      <td>{u.College}</td>
                      <td>{u.DesiredRole}</td>
                      <td>
                        <span className={`score-badge ${sk?.ProfileScore >= 85 ? 'high' : sk?.ProfileScore >= 70 ? 'mid' : 'low'}`}>
                          {sk?.ProfileScore || '—'}
                        </span>
                      </td>
                      <td><span className="status-badge active">{u.Status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Job Monitor ───────────────── */}
        {tab === 'jobs' && (
          <div className="admin-panel">
            <h2>Job Monitor</h2>
            <p className="panel-desc">Real-time view of all scraped jobs across platforms</p>
            <table className="admin-table full">
              <thead>
                <tr><th>Title</th><th>Company</th><th>Source</th><th>Location</th><th>Type</th><th>Salary</th><th>Active</th></tr>
              </thead>
              <tbody>
                {liveJobs.map(j => (
                  <tr key={j.JobID}>
                    <td><strong>{j.Title}</strong></td>
                    <td>{j.Company}</td>
                    <td><span className={`source-badge src-${j.Source.toLowerCase().replace(/\s/g, '')}`}>{j.Source}</span></td>
                    <td>{j.Location}</td>
                    <td>{j.JobType}</td>
                    <td className="mono">{j.Salary}</td>
                    <td>{j.IsActive ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Match Results ─────────────── */}
        {tab === 'matches' && (
          <div className="admin-panel">
            <h2>Match Results</h2>
            <p className="panel-desc">AI-generated match scores per user per job</p>
            <table className="admin-table full">
              <thead>
                <tr><th>User</th><th>Job</th><th>Score</th><th>Verdict</th><th>Matched</th><th>Missing</th><th>Email</th></tr>
              </thead>
              <tbody>
                {matchResultsList.map(m => {
                  const user = users.find(u => u.UserID === m.UserID);
                  const job = liveJobs.find(j => j.JobID === m.JobID);
                  return (
                    <tr key={m.MatchID}>
                      <td>{user?.Name || m.UserID}</td>
                      <td>{job?.Title || m.JobID}<br /><span className="text-muted text-sm">{job?.Company}</span></td>
                      <td>
                        <span className={`score-badge ${m.OverallMatchScore >= 85 ? 'high' : m.OverallMatchScore >= 70 ? 'mid' : 'low'}`}>
                          {m.OverallMatchScore}%
                        </span>
                      </td>
                      <td className="mono text-sm">{m.Verdict}</td>
                      <td className="skills-cell">{m.MatchedSkills.map(s => <span key={s} className="skill-chip matched">{s}</span>)}</td>
                      <td className="skills-cell">{m.MissingSkills.map(s => <span key={s} className="skill-chip missing">{s}</span>)}</td>
                      <td>{m.EmailSent ? '✅' : '⏳'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Email Logs ────────────────── */}
        {tab === 'emails' && (
          <div className="admin-panel">
            <h2>Email Logs</h2>
            <p className="panel-desc">Full history of every job alert email sent via Outlook</p>
            <table className="admin-table full">
              <thead>
                <tr><th>Recipient</th><th>Subject</th><th>Jobs</th><th>Time</th><th>Template</th><th>Status</th></tr>
              </thead>
              <tbody>
                {emailLogsList.map(e => (
                  <tr key={e.EmailID}>
                    <td className="mono">{e.RecipientEmail}</td>
                    <td>{e.Subject}</td>
                    <td>{e.JobsIncluded.length}</td>
                    <td className="mono text-sm">{new Date(e.Timestamp).toLocaleString()}</td>
                    <td className="mono text-sm">{e.Template}</td>
                    <td><span className={`status-badge ${e.DeliveryStatus.toLowerCase()}`}>{e.DeliveryStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Power BI ──────────────────── */}
        {tab === 'powerbi' && (
          <div className="admin-panel">
            <h2>Power BI Analytics</h2>
            <p className="panel-desc">Embedded 8-page Power BI report connected to SharePoint</p>
            {showPbi && pbiUrl ? (
              <div className="pbi-embed-container">
                <div className="pbi-toolbar">
                  <span>Power BI Report</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => setShowPbi(false)}>Close</button>
                </div>
                <iframe className="pbi-frame" src={pbiUrl} title="Power BI" allowFullScreen />
              </div>
            ) : (
              <div className="pbi-placeholder">
                <div className="pbi-icon">📊</div>
                <h3>Embed Power BI Report</h3>
                <p>8 admin report pages: Overview, User Analytics, Job Market, Match Results, Email Performance, Skill Gap Heatmap, Placement Trends, System Health</p>
                <div className="pbi-input-row">
                  <input type="text" className="form-input" placeholder="https://app.powerbi.com/view?r=..." value={pbiUrl} onChange={e => setPbiUrl(e.target.value)} />
                  <button className="btn btn-primary" onClick={() => pbiUrl.trim() && setShowPbi(true)} disabled={!pbiUrl.trim()}>Embed</button>
                </div>
                <div className="pbi-pages">
                  {['Overview Home', 'User Analytics', 'Job Market View', 'Match Results', 'Email Performance', 'Skill Gap Heatmap', 'Placement Trends', 'System Health'].map(p => (
                    <span key={p} className="pbi-page-tag">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Scraper Control ───────────── */}
        {tab === 'scraper' && (
          <div className="admin-panel">
            <h2>Scraper Control Panel</h2>
            <p className="panel-desc">Manage job scraping schedule and trigger manual runs</p>
            <div className="admin-row">
              <div className="admin-card">
                <h3>Manual Trigger</h3>
                <p className="text-muted">Run a full scrape cycle across all enabled portals now.</p>
                <button className="btn btn-primary" onClick={handleScrape} disabled={scrapeStatus === 'running'}>
                  {scrapeStatus === 'running' ? '⏳ Scraping...' : scrapeStatus === 'done' ? '✅ Completed' : '🔍 Run Scrape Now'}
                </button>
                <div className="scraper-info">
                  <div><span className="info-label">Last Run:</span> {auditLogList.find(a => a.FlowName === 'F2-JobScraper')?.Timestamp ? new Date(auditLogList.find(a => a.FlowName === 'F2-JobScraper').Timestamp).toLocaleString() : '—'}</div>
                  <div><span className="info-label">Schedule:</span> Every {settings.ScrapeInterval} hours</div>
                  <div><span className="info-label">Total Jobs:</span> {liveJobs.length}</div>
                </div>
              </div>
              <div className="admin-card">
                <h3>Enabled Portals</h3>
                <div className="portal-list">
                  {['LinkedIn', 'Naukri', 'Indeed', 'Google Jobs', 'Shine', 'Glassdoor'].map(p => (
                    <div key={p} className="portal-row">
                      <span className={`source-badge src-${p.toLowerCase().replace(/\s/g, '')}`}>{p}</span>
                      <span className={`portal-status ${settings.EnabledPortals.includes(p) ? 'on' : 'off'}`}>
                        {settings.EnabledPortals.includes(p) ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-card">
              <h3>Recent Scrape Logs</h3>
              <table className="admin-table full">
                <thead><tr><th>Time</th><th>Action</th><th>Result</th><th>Duration</th><th>Error</th></tr></thead>
                <tbody>
                  {auditLogList.filter(a => a.FlowName === 'F2-JobScraper').map(a => (
                    <tr key={a.LogID}>
                      <td className="mono text-sm">{new Date(a.Timestamp).toLocaleString()}</td>
                      <td>{a.Action}</td>
                      <td><span className={`status-badge ${a.Result.toLowerCase()}`}>{a.Result}</span></td>
                      <td className="mono">{a.Duration}</td>
                      <td className="text-sm">{a.ErrorText || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Skill Gap Report ──────────── */}
        {tab === 'skillgap' && (
          <div className="admin-panel">
            <h2>Skill Gap Report</h2>
            <p className="panel-desc">Aggregate view: market demand vs. candidate skill gaps</p>
            <table className="admin-table full">
              <thead><tr><th>Skill</th><th>Market Demand</th><th>Gap Count</th><th>Gap %</th><th>Trend</th></tr></thead>
              <tbody>
                {skillGapData.sort((a, b) => b.GapCount - a.GapCount).map(s => (
                  <tr key={s.SkillName}>
                    <td><strong>{s.SkillName}</strong></td>
                    <td>
                      <div className="bar-inline">
                        <div className="bar-fill-inline" style={{ width: `${(s.DemandCount / 60) * 100}%` }} />
                        <span>{s.DemandCount}</span>
                      </div>
                    </td>
                    <td><span className="gap-count">{s.GapCount}</span></td>
                    <td className="mono">{Math.round(s.GapCount / Math.max(s.DemandCount, 1) * 100)}%</td>
                    <td className="mono text-sm">{s.TrendWeek}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Settings ──────────────────── */}
        {tab === 'settings' && (
          <div className="admin-panel">
            <h2>Settings</h2>
            <p className="panel-desc">Configure platform-wide settings for scraping, matching, and emails</p>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Scrape Interval (hours)</label>
                <input type="number" className="form-input" value={settings.ScrapeInterval} onChange={e => updateSettings({ ScrapeInterval: parseInt(e.target.value) || 6 })} min="1" max="24" />
              </div>
              <div className="setting-item">
                <label>Min Match % Threshold</label>
                <input type="number" className="form-input" value={settings.MinMatchPercent} onChange={e => updateSettings({ MinMatchPercent: parseInt(e.target.value) || 60 })} min="0" max="100" />
              </div>
              <div className="setting-item">
                <label>Email Frequency</label>
                <select className="form-input" value={settings.EmailFrequency} onChange={e => updateSettings({ EmailFrequency: e.target.value })}>
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Portal Status</label>
                <span className={`status-badge ${settings.PortalEnabled ? 'active' : 'off'}`}>{settings.PortalEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: '1.5rem' }}>
              <h3>Integration Status</h3>
              <div className="integration-grid">
                {[
                  { name: 'SharePoint Online', icon: '📁', status: 'Connected', desc: 'Resume & data storage' },
                  { name: 'Power BI', icon: '📊', status: showPbi ? 'Embedded' : 'Not Configured', desc: '8-page dashboard' },
                  { name: 'Power Automate', icon: '⚡', status: 'Connected', desc: '6 cloud flows' },
                  { name: 'Claude AI / Azure OpenAI', icon: '🤖', status: 'Connected', desc: 'Resume parse + skill match' },
                  { name: 'Python Scraper + Azure Function', icon: '🔍', status: 'Running', desc: 'Job scraping engine' },
                  { name: 'Outlook 365', icon: '📧', status: 'Connected', desc: 'Email dispatch' },
                  { name: 'Microsoft Entra ID', icon: '🛡️', status: 'Active', desc: 'SSO + RBAC' },
                ].map(s => (
                  <div key={s.name} className="integration-item">
                    <span className="int-icon">{s.icon}</span>
                    <div>
                      <div className="int-name">{s.name}</div>
                      <div className="int-status">{s.status}</div>
                      <div className="int-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Audit Log ─────────────────── */}
        {tab === 'audit' && (
          <div className="admin-panel">
            <h2>Audit Log</h2>
            <p className="panel-desc">Every system action logged with actor, timestamp, and result</p>
            <table className="admin-table full">
              <thead><tr><th>Time</th><th>Flow</th><th>Action</th><th>Actor</th><th>Result</th><th>Duration</th><th>Error</th></tr></thead>
              <tbody>
                {auditLogList.map(a => (
                  <tr key={a.LogID}>
                    <td className="mono text-sm">{new Date(a.Timestamp).toLocaleString()}</td>
                    <td><span className="flow-badge">{a.FlowName}</span></td>
                    <td>{a.Action}</td>
                    <td className="mono">{a.Actor}</td>
                    <td><span className={`status-badge ${a.Result.toLowerCase()}`}>{a.Result}</span></td>
                    <td className="mono">{a.Duration}</td>
                    <td className="text-sm" style={{ color: a.ErrorText ? 'var(--red)' : 'var(--muted2)' }}>{a.ErrorText || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
