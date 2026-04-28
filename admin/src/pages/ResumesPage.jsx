import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllUserSkills, getAllUsers } from '../services/adminService';

export default function ResumesPage() {
  const [skills, setSkills] = useState([]);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('ats-desc');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([getAllUserSkills(), getAllUsers()])
      .then(([s, u]) => { setSkills(s); setUsers(u); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getUserEmail = (uid) => users.find(u => (u.uid || u.id) === uid)?.email || uid;
  const getUserName  = (uid) => users.find(u => (u.uid || u.id) === uid)?.fullName || 'Unknown';

  const sorted = [...skills]
    .filter(s => {
      if (!search) return true;
      const email = getUserEmail(s.userId).toLowerCase();
      const name  = getUserName(s.userId).toLowerCase();
      return email.includes(search.toLowerCase()) || name.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'ats-desc') return (b.atsScore?.total || 0) - (a.atsScore?.total || 0);
      if (sortBy === 'ats-asc')  return (a.atsScore?.total || 0) - (b.atsScore?.total || 0);
      if (sortBy === 'date-desc') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
    });

  const atsColor = (score) =>
    score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

  const atsBadge = (score) =>
    score >= 80 ? 'badge-green' : score >= 60 ? 'badge-yellow' : 'badge-red';

  if (loading) return (
    <AdminLayout title="Resumes" subtitle="All uploaded resumes">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Resume Management" subtitle={`${skills.length} resumes uploaded`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          className="input-field max-w-xs"
          placeholder="🔍  Search by user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="resume-search"
        />
        <select
          className="input-field max-w-[200px]"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          id="resume-sort"
        >
          <option value="ats-desc">ATS Score ↓</option>
          <option value="ats-asc">ATS Score ↑</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
        </select>
        <span className="text-slate-500 text-sm self-center ml-auto">{sorted.length} results</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Resumes',  value: skills.length,                                                    color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { label: 'Avg ATS Score',  value: skills.length ? Math.round(skills.reduce((s,u) => s+(u.atsScore?.total||0),0)/skills.length) + '%' : '0%', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
          { label: 'Elite (90+)',    value: skills.filter(s=>(s.atsScore?.total||0)>=90).length,              color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
          { label: 'Need Work (<60)',value: skills.filter(s=>(s.atsScore?.total||0)<60).length,               color: 'bg-red-500/10 border-red-500/20 text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`glass-card p-4 border ${color}`}>
            <p className="section-label mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border bg-admin-hover/50">
                  <th className="table-header text-left py-3 px-4">User</th>
                  <th className="table-header text-left py-3 px-4">ATS Score</th>
                  <th className="table-header text-left py-3 px-4 hidden md:table-cell">Skills</th>
                  <th className="table-header text-left py-3 px-4 hidden lg:table-cell">Experience</th>
                  <th className="table-header text-left py-3 px-4 hidden lg:table-cell">Updated</th>
                  <th className="table-header text-left py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(s => (
                  <tr
                    key={s.userId}
                    className={`table-row cursor-pointer ${selected?.userId === s.userId ? 'bg-brand-500/5' : ''}`}
                    onClick={() => setSelected(s)}
                  >
                    <td className="table-cell">
                      <div>
                        <p className="text-white text-sm font-medium">{getUserName(s.userId)}</p>
                        <p className="text-slate-500 text-xs">{getUserEmail(s.userId)}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[80px] bg-admin-border rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(s.atsScore?.total||0) >= 80 ? 'bg-green-400' : (s.atsScore?.total||0) >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${s.atsScore?.total || 0}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${atsColor(s.atsScore?.total||0)}`}>
                          {s.atsScore?.total || 0}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell text-slate-400 text-xs">
                      {(s.skills?.technical?.length || 0) + (s.skills?.tools?.length || 0)} skills
                    </td>
                    <td className="table-cell hidden lg:table-cell text-slate-400 text-xs">
                      {s.experienceYears ? `${s.experienceYears} yrs` : '—'}
                    </td>
                    <td className="table-cell hidden lg:table-cell text-slate-400 text-xs">
                      {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-cell">
                      <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-12 text-sm">No resumes found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lg:w-80 glass-card p-6 animate-slide-in flex-shrink-0 self-start sticky top-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-white font-semibold">Resume Details</p>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>

            <div className="text-center mb-5">
              <div className="text-5xl font-black mb-1" style={{ color: (selected.atsScore?.total||0) >= 80 ? '#4ade80' : (selected.atsScore?.total||0) >= 60 ? '#facc15' : '#f87171' }}>
                {selected.atsScore?.total || 0}
              </div>
              <p className="text-slate-500 text-xs">ATS Score</p>
              <span className={`badge mt-2 ${atsBadge(selected.atsScore?.total||0)}`}>
                {(selected.atsScore?.total||0) >= 80 ? 'Excellent' : (selected.atsScore?.total||0) >= 60 ? 'Good' : 'Needs Work'}
              </span>
            </div>

            {/* ATS Breakdown */}
            {selected.atsScore?.breakdown && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-400 mb-3">ATS Breakdown</p>
                {Object.entries(selected.atsScore.breakdown).map(([k, v]) => (
                  <div key={k} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 capitalize">{k}</span>
                      <span className="text-white font-semibold">{v}/100</span>
                    </div>
                    <div className="bg-admin-border rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {selected.skills && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-400 mb-3">Top Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...(selected.skills.technical || []), ...(selected.skills.tools || [])].slice(0, 10).map(sk => (
                    <span key={sk} className="badge badge-blue text-[10px]">{sk}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {selected.executiveSummary && (
              <div className="bg-admin-hover rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-400 mb-2">AI Summary</p>
                <p className="text-slate-300 text-xs leading-relaxed">{selected.executiveSummary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
