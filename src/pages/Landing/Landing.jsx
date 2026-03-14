import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-600">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 text-4xl font-bold text-blue-400">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  );
}

export default function Landing() {
  const { getStats, liveJobs } = useApp();
  const stats = getStats();

  const skillMap = {};
  liveJobs.forEach((job) => job.RequiredSkills?.forEach((skill) => {
    skillMap[skill] = (skillMap[skill] || 0) + 1;
  }));

  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill, count]) => ({ skill, count }));

  const topSkillMax = topSkills[0]?.count || 1;

  return (
    <div className="bg-slate-900 text-slate-100">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="inline-flex rounded-full border border-blue-700 bg-blue-900/40 px-4 py-1 text-xs font-semibold text-blue-300">
            ⚡ AI-POWERED PLACEMENT PLATFORM
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Get Placed Based on <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Skills</span>, Not CGPA
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-400">
            SkillBridge connects candidates with real opportunities through AI-powered profile scoring, job scraping, and deep skill matching.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-500">
              Get Started →
            </Link>
            <Link to="/login" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition-all duration-200 hover:bg-slate-800">
              Sign In
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl shadow-black/30 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">🎯 Skill Match</span>
            <span className="rounded-full border border-emerald-700 bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-300">92% Match</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['React', 'Node.js', 'MongoDB', 'JavaScript'].map((skill) => (
              <span key={skill} className="rounded-full border border-emerald-700 bg-emerald-900/40 px-3 py-1 text-xs text-emerald-300">{skill}</span>
            ))}
            <span className="rounded-full border border-red-700 bg-red-900/40 px-3 py-1 text-xs text-red-300">TypeScript</span>
          </div>
          <div className="mt-5 border-t border-slate-700 pt-4">
            <p className="text-sm font-semibold text-slate-100">Frontend Developer - Google</p>
            <p className="text-sm text-emerald-400">15-22 LPA</p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-700 bg-slate-800/50 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <StatCard icon="👨‍🎓" value={stats.totalUsers} label="Registered Users" />
          <StatCard icon="📄" value={stats.resumesUploaded} label="Resumes Parsed" />
          <StatCard icon="💼" value={stats.activeJobs} label="Active Job Openings" />
          <StatCard icon="🎯" value={`${stats.avgMatchScore}%`} label="Avg Match Score" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-100">How SkillBridge Works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: '📄', title: 'Upload Resume', desc: 'Upload PDF or DOCX and let AI extract your profile, skills, and ATS score.' },
            { icon: '🌐', title: 'Scrape Live Jobs', desc: 'Smart scraper pulls jobs from major portals and keeps your feed fresh in real time.' },
            { icon: '🎯', title: 'Get Matched', desc: 'Weighted matching compares your skills with job requirements and ranks opportunities.' },
          ].map((step, idx) => (
            <div key={step.title} className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-600">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{idx + 1}</div>
              <div className="mb-3 text-3xl">{step.icon}</div>
              <h3 className="text-lg font-semibold text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-800/50 p-6">
          <h2 className="text-2xl font-bold text-slate-100">Top In-Demand Skills</h2>
          <div className="mt-6 space-y-3">
            {topSkills.map((skill) => (
              <div key={skill.skill} className="flex items-center gap-3">
                <div className="w-28 shrink-0 text-sm text-slate-300">{skill.skill}</div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-700"
                    style={{ width: `${(skill.count / topSkillMax) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-right text-xs text-slate-400">{skill.count} jobs</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-100">Why SkillBridge</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { icon: '✅', title: 'Skill-First Hiring', desc: 'No CGPA bias. Candidates are evaluated on demonstrated competencies and outcomes.' },
            { icon: '📉', title: 'Gap Intelligence', desc: 'Learn what to improve next with role-specific skill-gap and ATS insights.' },
            { icon: '🔔', title: 'Smart Alerts', desc: 'Get timely opportunities with actionable recommendations and profile fit context.' },
            { icon: '📊', title: 'Placement Analytics', desc: 'Track trends, outcomes, and platform-level KPIs in one dashboard.' },
          ].map((feature) => (
            <div key={feature.title} className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-600">
              <div className="text-2xl">{feature.icon}</div>
              <h3 className="mt-3 text-base font-semibold text-slate-100">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-700/50 bg-gradient-to-r from-blue-900/40 to-violet-900/40 p-10 text-center shadow-lg shadow-black/20">
          <h2 className="text-3xl font-bold text-slate-100">Ready to launch your placement journey?</h2>
          <p className="mt-3 text-slate-300">Build your profile, match with real opportunities, and get hired faster.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-500">
              Get Started →
            </Link>
            <Link to="/login" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition-all duration-200 hover:bg-slate-800">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
