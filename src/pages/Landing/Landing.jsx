import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Landing.css';

export default function Landing() {
  const { getStats, liveJobs } = useApp();
  const stats = getStats();

  // Compute top skills from live jobs
  const skillMap = {};
  liveJobs.forEach(j => j.RequiredSkills?.forEach(s => { skillMap[s] = (skillMap[s] || 0) + 1; }));
  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill, count]) => ({ skill, count }));

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content slide-up">
            <span className="hero-badge">⚡ AI-POWERED PLACEMENT PLATFORM</span>
            <h1>Get Placed Based on <span className="highlight">Skills</span>, Not CGPA</h1>
            <p>
              SkillBridge connects students with companies through intelligent skill matching.
              No academic bias — just your competencies, certifications, and project experience.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-lg btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-lg btn-outline">Sign In</Link>
            </div>
          </div>
          <div className="hero-visual slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="hero-card">
              <div className="hero-card-header">
                <span>🎯 Skill Match</span>
                <span className="badge badge-success">92% Match</span>
              </div>
              <div className="hero-skills">
                {['React', 'Node.js', 'MongoDB', 'JavaScript'].map(s => (
                  <span key={s} className="skill-tag matched">{s}</span>
                ))}
                <span className="skill-tag missing">TypeScript</span>
              </div>
              <div className="hero-card-footer">
                <strong>Frontend Developer — Google</strong>
                <span className="text-muted text-sm">₹15-22 LPA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="grid grid-4">
            <div className="stat-card fade-in">
              <div className="stat-icon">👨‍🎓</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Registered Users</div>
            </div>
            <div className="stat-card fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon">📄</div>
              <div className="stat-value">{stats.resumesUploaded}</div>
              <div className="stat-label">Resumes Parsed</div>
            </div>
            <div className="stat-card fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon">💼</div>
              <div className="stat-value">{stats.activeJobs}</div>
              <div className="stat-label">Active Job Openings</div>
            </div>
            <div className="stat-card fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{stats.avgMatchScore}%</div>
              <div className="stat-label">Avg Match Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">How SkillBridge Works</h2>
          <div className="grid grid-3">
            {[
              { icon: '�', title: 'Upload Your Resume', desc: 'Upload PDF or DOCX. AI auto-parses your skills, certifications, experience, and education.' },
              { icon: '🤖', title: 'AI Skill Matching', desc: 'Our engine scrapes jobs from 6 portals and matches your profile with live openings.' },
              { icon: '🎉', title: 'Get Placed!', desc: 'Receive personalised email alerts, track applications, and bridge skill gaps.' },
            ].map((step, i) => (
              <div key={i} className="card how-card fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="how-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="how-step">Step {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Skills */}
      <section className="skills-section">
        <div className="container">
          <h2 className="section-title">Top In-Demand Skills</h2>
          <p className="section-subtitle">Based on current job openings across all partner companies</p>
          <div className="chart-bar-container" style={{ maxWidth: 600, margin: '0 auto' }}>
            {topSkills.map((s, i) => (
              <div key={s.skill} className="chart-bar-row fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="chart-bar-label">{s.skill}</div>
                <div className="chart-bar">
                  <div className="chart-bar-fill" style={{ width: `${(s.count / topSkills[0].count) * 100}%` }}>
                    <span className="chart-bar-value">{s.count} jobs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why SkillBridge?</h2>
          <div className="grid grid-2">
            {[
              { icon: '✅', title: 'No CGPA Filter', desc: 'Every student gets a fair chance based purely on skills and competencies.' },
              { icon: '📊', title: 'Skill Gap Analysis', desc: 'See exactly which skills you need to learn for your dream job.' },
              { icon: '🔔', title: 'Smart Notifications', desc: 'Get instant alerts when new matching jobs are posted.' },
              { icon: '📈', title: 'Placement Analytics', desc: 'Track trends, hiring patterns, and skill demand data.' },
              { icon: '📄', title: 'Auto Resume Formatting', desc: 'Your profile is automatically formatted for company viewing.' },
              { icon: '🤝', title: 'Direct Communication', desc: 'Companies can directly reach out to matched students.' },
            ].map((f, i) => (
              <div key={i} className="card feature-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p className="text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Ready to Get Started?</h2>
          <p>Join SkillBridge today and let your skills speak for themselves.</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-lg btn-primary">Sign In & Get Started</Link>
            <Link to="/login" className="btn btn-lg btn-violet">Explore Platform</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
