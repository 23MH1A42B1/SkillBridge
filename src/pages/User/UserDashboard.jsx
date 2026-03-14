import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './User.css';

const TABS = [
  { key: 'overview', label: 'Dashboard', icon: '🏠' },
  { key: 'resume', label: 'Resume Upload', icon: '📄' },
  { key: 'skills', label: 'Skill Profile', icon: '🧠' },
  { key: 'jobs', label: 'Live Job Feed', icon: '💼' },
  { key: 'matches', label: 'Job Matches', icon: '🎯' },
  { key: 'skillgap', label: 'Skill Gap Advisor', icon: '📉' },
  { key: 'emailprefs', label: 'Email Preferences', icon: '📧' },
  { key: 'powerbi', label: 'My Power BI', icon: '📊' },
  { key: 'saved', label: 'Saved Jobs', icon: '🔖' },
  { key: 'notifs', label: 'Notifications', icon: '🔔' },
];

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

  const unreadCount = notifs.filter(n => !n.Read).length;
  const topMatches = useMemo(() => {
    return matches
      .map(m => ({ ...m, job: getJobByID(m.JobID) }))
      .filter(m => m.job)
      .sort((a, b) => b.OverallMatchScore - a.OverallMatchScore);
  }, [matches, getJobByID]);

  // Simulate resume parse
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
    const file = e.dataTransfer?.files[0] || e.target?.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setResumeFile(file);
    }
  };

  // Missing skills from all matches aggregated
  const missingSkillsAgg = useMemo(() => {
    const map = {};
    matches.forEach(m => m.MissingSkills.forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [matches]);

  return (
    <div className="user-layout">
      <aside className="user-sidebar">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">{currentUser?.Name?.charAt(0) || '?'}</div>
          <div className="sidebar-name">{currentUser?.Name}</div>
          <div className="sidebar-role">{currentUser?.DesiredRole || 'Candidate'}</div>
        </div>
        {TABS.map(t => (
          <button key={t.key} className={`sidebar-item ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            <span className="sidebar-icon">{t.icon}</span>
            <span>{t.label}</span>
            {t.key === 'notifs' && unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
          </button>
        ))}
      </aside>

      <main className="user-main">
        {/* ─── Overview ──────────────────── */}
        {tab === 'overview' && (
          <div className="user-panel">
            <h2>Welcome, {currentUser?.Name?.split(' ')[0]}</h2>
            <p className="panel-desc">Your personalised placement dashboard</p>
            <div className="overview-stats">
              {[
                { label: 'Profile Score', value: skills?.ProfileScore || '—', icon: '📊', color: 'var(--cyan)' },
                { label: 'Job Matches', value: matches.length, icon: '🎯', color: 'var(--green)' },
                { label: 'Best Match', value: topMatches[0] ? `${topMatches[0].OverallMatchScore}%` : '—', icon: '🏆', color: 'var(--violet2)' },
                { label: 'Saved Jobs', value: saved.length, icon: '🔖', color: 'var(--amber)' },
                { label: 'Unread Alerts', value: unreadCount, icon: '🔔', color: 'var(--orange)' },
              ].map((s, i) => (
                <div key={i} className="overview-card" style={{ '--accent': s.color }}>
                  <span className="ov-icon">{s.icon}</span>
                  <div className="ov-value">{s.value}</div>
                  <div className="ov-label">{s.label}</div>
                </div>
              ))}
            </div>

            {topMatches.length > 0 && (
              <div className="user-section">
                <h3>Top 5 Matched Jobs</h3>
                <div className="match-cards">
                  {topMatches.slice(0, 5).map(m => (
                    <div key={m.MatchID} className="match-card">
                      <div className="mc-header">
                        <div>
                          <div className="mc-title">{m.job.Title}</div>
                          <div className="mc-company">{m.job.Company} · {m.job.Location}</div>
                        </div>
                        <div className={`mc-score ${m.OverallMatchScore >= 85 ? 'high' : m.OverallMatchScore >= 70 ? 'mid' : 'low'}`}>
                          {m.OverallMatchScore}%
                        </div>
                      </div>
                      <div className="mc-skills">
                        {m.MatchedSkills.map(s => <span key={s} className="skill-tag matched">{s}</span>)}
                        {m.MissingSkills.map(s => <span key={s} className="skill-tag missing">{s}</span>)}
                      </div>
                      <div className="mc-footer">
                        <span className={`source-badge src-${m.job.Source.toLowerCase().replace(/\s/g, '')}`}>{m.job.Source}</span>
                        <span className="mc-salary">{m.job.Salary}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Resume Upload ─────────────── */}
        {tab === 'resume' && (
          <div className="user-panel">
            <h2>Resume Upload</h2>
            <p className="panel-desc">Upload PDF or DOCX. AI will auto-parse your skills, experience, and certifications.</p>
            <div className="upload-zone" onDrop={handleFileDrop} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('resume-input').click()}>
              <input id="resume-input" type="file" accept=".pdf,.docx" onChange={handleFileDrop} hidden />
              {resumeFile ? (
                <div className="upload-selected">
                  <span className="upload-file-icon">📎</span>
                  <span>{resumeFile.name}</span>
                  <button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); setResumeFile(null); }}>Remove</button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">📄</div>
                  <p>Drop your resume here or click to browse</p>
                  <span className="upload-formats">Supports PDF, DOCX</span>
                </>
              )}
            </div>
            <div className="or-divider"><span>OR</span></div>
            <div className="paste-section">
              <label className="form-label">Paste resume text</label>
              <textarea className="form-input resume-textarea" value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume content here..." rows={8} />
            </div>
            <button className="btn btn-primary" onClick={handleParse} disabled={parsing || (!resumeText.trim() && !resumeFile)}>
              {parsing ? '🤖 AI Parsing...' : '🚀 Parse with AI'}
            </button>
            {skills?.IsProfileComplete && (
              <div className="parse-result">
                <span className="parse-status">✅ Profile parsed successfully — {skills.TechnicalSkills?.length || 0} technical skills extracted</span>
              </div>
            )}
          </div>
        )}

        {/* ─── Skill Profile ────────────── */}
        {tab === 'skills' && (
          <div className="user-panel">
            <h2>My Skill Profile</h2>
            <p className="panel-desc">AI-extracted skills grouped by category. Profile score 0-100.</p>
            {skills ? (
              <>
                <div className="profile-score-row">
                  <div className="score-ring-container">
                    <svg viewBox="0 0 120 120" className="score-ring">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke={skills.ProfileScore >= 85 ? 'var(--green)' : skills.ProfileScore >= 70 ? 'var(--amber)' : 'var(--rose)'}
                        strokeWidth="8" strokeDasharray={`${skills.ProfileScore * 3.14} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                      <text x="60" y="56" textAnchor="middle" className="score-text">{skills.ProfileScore}</text>
                      <text x="60" y="72" textAnchor="middle" className="score-sub">/ 100</text>
                    </svg>
                  </div>
                  <div className="profile-summary">
                    <h3>{currentUser?.Name}</h3>
                    <p>{skills.ProfileSummary}</p>
                    <div className="suggested-roles">
                      {skills.SuggestedRoles?.map(r => <span key={r} className="role-tag">{r}</span>)}
                    </div>
                  </div>
                </div>

                <div className="skill-categories">
                  {[
                    { label: 'Technical Skills', items: skills.TechnicalSkills, cls: 'tech' },
                    { label: 'Soft Skills', items: skills.SoftSkills, cls: 'soft' },
                    { label: 'Tools & Platforms', items: skills.Tools, cls: 'tools' },
                    { label: 'Certifications', items: skills.Certifications, cls: 'cert' },
                  ].map(cat => (
                    <div key={cat.label} className="skill-cat-card">
                      <h4>{cat.label}</h4>
                      <div className="skill-tags">
                        {cat.items?.map(s => <span key={s} className={`skill-tag ${cat.cls}`}>{s}</span>)}
                      </div>
                    </div>
                  ))}
                </div>

                {skills.Experience?.length > 0 && (
                  <div className="user-section">
                    <h3>Experience</h3>
                    {skills.Experience.map((e, i) => (
                      <div key={i} className="exp-card">
                        <div className="exp-title">{e.title}</div>
                        <div className="exp-company">{e.company} · {e.duration}</div>
                        <div className="exp-desc">{e.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                {skills.Education?.length > 0 && (
                  <div className="user-section">
                    <h3>Education</h3>
                    {skills.Education.map((e, i) => (
                      <div key={i} className="edu-card">
                        <strong>{e.degree}</strong> — {e.institution} ({e.year}) · {e.percentage}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📄</span>
                <p>No skill profile yet. Upload your resume to get started.</p>
                <button className="btn btn-primary" onClick={() => setTab('resume')}>Upload Resume</button>
              </div>
            )}
          </div>
        )}

        {/* ─── Live Job Feed ─────────────── */}
        {tab === 'jobs' && (
          <div className="user-panel">
            <h2>Live Job Feed</h2>
            <p className="panel-desc">Personalised listings ranked by match %. {liveJobs.filter(j => j.IsActive).length} active jobs.</p>
            <div className="job-feed">
              {liveJobs.filter(j => j.IsActive).map(job => {
                const match = matches.find(m => m.JobID === job.JobID);
                const isSaved = saved.some(s => s.JobID === job.JobID);
                return (
                  <div key={job.JobID} className="job-card">
                    <div className="jc-header">
                      <div>
                        <div className="jc-title">{job.Title}</div>
                        <div className="jc-meta">{job.Company} · {job.Location} · {job.WorkMode}</div>
                      </div>
                      {match && (
                        <div className={`jc-match ${match.OverallMatchScore >= 85 ? 'high' : match.OverallMatchScore >= 70 ? 'mid' : 'low'}`}>
                          {match.OverallMatchScore}%
                        </div>
                      )}
                    </div>
                    <p className="jc-desc">{job.JobDescription}</p>
                    <div className="jc-skills">
                      {job.RequiredSkills.map(s => {
                        const has = skills?.TechnicalSkills?.includes(s) || skills?.Tools?.includes(s);
                        return <span key={s} className={`skill-tag ${has ? 'matched' : 'missing'}`}>{s}</span>;
                      })}
                    </div>
                    <div className="jc-footer">
                      <div className="jc-badges">
                        <span className={`source-badge src-${job.Source.toLowerCase().replace(/\s/g, '')}`}>{job.Source}</span>
                        <span className="jc-salary">{job.Salary}</span>
                        <span className="jc-type">{job.JobType}</span>
                      </div>
                      <div className="jc-actions">
                        <button className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-outline'}`} onClick={() => !isSaved && saveJob(uid, job.JobID)}>
                          {isSaved ? '✓ Saved' : '🔖 Save'}
                        </button>
                        <a href={job.ApplyURL} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">Apply →</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Job Match Detail ──────────── */}
        {tab === 'matches' && (
          <div className="user-panel">
            <h2>Job Match Details</h2>
            <p className="panel-desc">Full breakdown: skills you have (green), missing (red), bonus (amber)</p>
            {topMatches.length > 0 ? (
              <div className="match-detail-list">
                {topMatches.map(m => (
                  <div key={m.MatchID} className="match-detail-card">
                    <div className="md-header">
                      <div>
                        <div className="md-title">{m.job.Title}</div>
                        <div className="md-company">{m.job.Company} · {m.job.Location}</div>
                      </div>
                      <div className="md-score-container">
                        <div className={`md-score ${m.OverallMatchScore >= 85 ? 'high' : m.OverallMatchScore >= 70 ? 'mid' : 'low'}`}>
                          {m.OverallMatchScore}%
                        </div>
                        <div className="md-verdict">{m.Verdict}</div>
                      </div>
                    </div>
                    <div className="md-skills-grid">
                      <div className="md-skill-group">
                        <h4 className="green">Matched Skills</h4>
                        <div className="skill-tags">{m.MatchedSkills.map(s => <span key={s} className="skill-tag matched">{s}</span>)}</div>
                      </div>
                      <div className="md-skill-group">
                        <h4 className="red">Missing Skills</h4>
                        <div className="skill-tags">{m.MissingSkills.length > 0 ? m.MissingSkills.map(s => <span key={s} className="skill-tag missing">{s}</span>) : <span className="text-muted">None!</span>}</div>
                      </div>
                      <div className="md-skill-group">
                        <h4 className="amber">Bonus Skills</h4>
                        <div className="skill-tags">{m.BonusSkills?.map(s => <span key={s} className="skill-tag bonus">{s}</span>) || <span className="text-muted">—</span>}</div>
                      </div>
                    </div>
                    <div className="md-categories">
                      {m.CategoryScores && Object.entries(m.CategoryScores).map(([cat, score]) => (
                        <div key={cat} className="md-cat-bar">
                          <span className="md-cat-label">{cat}</span>
                          <div className="md-cat-track"><div className="md-cat-fill" style={{ width: `${score}%` }} /></div>
                          <span className="md-cat-val">{score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🎯</span>
                <p>No matches yet. Upload your resume to start matching with jobs.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Skill Gap Advisor ─────────── */}
        {tab === 'skillgap' && (
          <div className="user-panel">
            <h2>Skill Gap Advisor</h2>
            <p className="panel-desc">AI-generated plan: skills to learn, platforms to use, estimated time</p>
            {missingSkillsAgg.length > 0 ? (
              <>
                <div className="gap-overview">
                  <div className="gap-stat">
                    <div className="gap-stat-value">{missingSkillsAgg.length}</div>
                    <div className="gap-stat-label">Skill Gaps Found</div>
                  </div>
                  <div className="gap-stat">
                    <div className="gap-stat-value">{missingSkillsAgg[0]?.[0] || '—'}</div>
                    <div className="gap-stat-label">Top Priority Skill</div>
                  </div>
                </div>
                <div className="gap-list">
                  {missingSkillsAgg.map(([skill, count]) => {
                    const demand = skillGapData.find(s => s.SkillName === skill);
                    return (
                      <div key={skill} className="gap-card">
                        <div className="gap-header">
                          <span className="gap-skill">{skill}</span>
                          <span className="gap-priority">{count >= 2 ? 'Critical' : 'Important'}</span>
                        </div>
                        <div className="gap-details">
                          <span>Missing in {count} matched job{count > 1 ? 's' : ''}</span>
                          {demand && <span>Market demand: {demand.DemandCount} jobs</span>}
                        </div>
                        <div className="gap-learn">
                          <span className="learn-platform">🎓 Udemy / Coursera</span>
                          <span className="learn-time">~2-3 weeks</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🏆</span>
                <p>No skill gaps detected! Your profile covers all required skills.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Email Preferences ─────────── */}
        {tab === 'emailprefs' && (
          <div className="user-panel">
            <h2>Email Preferences</h2>
            <p className="panel-desc">Control how and when you receive job alert emails via Outlook</p>
            <div className="prefs-form">
              <div className="pref-item">
                <label>Alert Frequency</label>
                <select className="form-input" value={emailPrefs.AlertFrequency} onChange={e => updateEmailPrefs(uid, { AlertFrequency: e.target.value })}>
                  <option value="instant">Instant</option>
                  <option value="daily">Daily (8 AM & 6 PM)</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="pref-item">
                <label>Minimum Match % to receive</label>
                <input type="number" className="form-input" value={emailPrefs.MinMatchPercent} onChange={e => updateEmailPrefs(uid, { MinMatchPercent: parseInt(e.target.value) || 60 })} min="0" max="100" />
              </div>
              <div className="pref-item">
                <label>Opt In / Out</label>
                <button className={`btn ${emailPrefs.OptIn ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateEmailPrefs(uid, { OptIn: !emailPrefs.OptIn })}>
                  {emailPrefs.OptIn ? '✅ Subscribed' : '❌ Unsubscribed'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── My Power BI ───────────────── */}
        {tab === 'powerbi' && (
          <div className="user-panel">
            <h2>My Power BI Dashboard</h2>
            <p className="panel-desc">Personal embedded dashboard: match score trend, skill improvement, applications tracker</p>
            {showPbi && pbiUrl ? (
              <div className="pbi-embed-container">
                <div className="pbi-toolbar">
                  <span>My Dashboard</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => setShowPbi(false)}>Close</button>
                </div>
                <iframe className="pbi-frame" src={pbiUrl} title="My Power BI" allowFullScreen />
              </div>
            ) : (
              <div className="pbi-placeholder">
                <div className="pbi-icon">📊</div>
                <h3>Embed Your Personal Dashboard</h3>
                <p>5 pages: Match Summary, Skill Profile, Skill Gaps, Email History, Applications</p>
                <div className="pbi-input-row">
                  <input type="text" className="form-input" placeholder="https://app.powerbi.com/view?r=..." value={pbiUrl} onChange={e => setPbiUrl(e.target.value)} />
                  <button className="btn btn-primary" onClick={() => pbiUrl.trim() && setShowPbi(true)} disabled={!pbiUrl.trim()}>Embed</button>
                </div>
                <div className="pbi-pages">
                  {['My Match Summary', 'My Skill Profile', 'My Skill Gaps', 'My Email History', 'My Applications'].map(p => (
                    <span key={p} className="pbi-page-tag">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Saved Jobs ────────────────── */}
        {tab === 'saved' && (
          <div className="user-panel">
            <h2>Saved Jobs</h2>
            <p className="panel-desc">Bookmark jobs. Track: Applied, Interviewing, Offered, Rejected</p>
            {saved.length > 0 ? (
              <div className="saved-list">
                {saved.map(s => {
                  const job = getJobByID(s.JobID);
                  if (!job) return null;
                  return (
                    <div key={s.JobID} className="saved-card">
                      <div className="sv-header">
                        <div>
                          <div className="sv-title">{job.Title}</div>
                          <div className="sv-meta">{job.Company} · {job.Location}</div>
                        </div>
                        <select className="form-input form-input-sm" value={s.Status} onChange={e => updateSavedJobStatus(uid, s.JobID, e.target.value)}>
                          <option value="Saved">Saved</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <div className="sv-footer">
                        <span className={`status-pill ${s.Status.toLowerCase()}`}>{s.Status}</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => removeSavedJob(uid, s.JobID)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🔖</span>
                <p>No saved jobs yet. Browse the Job Feed to save positions.</p>
                <button className="btn btn-primary" onClick={() => setTab('jobs')}>Browse Jobs</button>
              </div>
            )}
          </div>
        )}

        {/* ─── Notifications ─────────────── */}
        {tab === 'notifs' && (
          <div className="user-panel">
            <h2>Notifications</h2>
            <div className="notif-header-row">
              <p className="panel-desc">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
              {unreadCount > 0 && (
                <button className="btn btn-sm btn-secondary" onClick={() => markAllNotificationsRead(uid)}>Mark All Read</button>
              )}
            </div>
            <div className="notif-list">
              {notifs.map(n => (
                <div key={n.NotifID} className={`notif-card ${n.Read ? 'read' : 'unread'}`} onClick={() => !n.Read && markNotificationRead(n.NotifID)}>
                  <span className="notif-type-icon">
                    {n.Type === 'match' ? '🎯' : n.Type === 'resume' ? '📄' : n.Type === 'skillgap' ? '📉' : '🔔'}
                  </span>
                  <div className="notif-content">
                    <div className="notif-message">{n.Message}</div>
                    <div className="notif-time">{new Date(n.Timestamp).toLocaleString()}</div>
                  </div>
                  {!n.Read && <span className="notif-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}