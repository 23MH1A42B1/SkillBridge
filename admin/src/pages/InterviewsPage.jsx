import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllInterviews, getAllUsers } from '../services/adminService';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);

  useEffect(() => {
    Promise.all([getAllInterviews(), getAllUsers()])
      .then(([iv, u]) => { setInterviews(iv); setUsers(u); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getUserEmail = (uid) => users.find(u => (u.uid || u.id) === uid)?.email || uid;

  const filtered = interviews.filter(iv => {
    if (!search) return true;
    const email = getUserEmail(iv.userId || iv.uid).toLowerCase();
    const title = (iv.jobTitle || '').toLowerCase();
    return email.includes(search.toLowerCase()) || title.includes(search.toLowerCase());
  });

  const scoreColor = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBadge = (s) => s >= 80 ? 'badge-green' : s >= 60 ? 'badge-yellow' : 'badge-red';

  if (loading) return (
    <AdminLayout title="Interviews" subtitle="All interview sessions">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  const avgScore = interviews.length
    ? Math.round(interviews.reduce((s, iv) => s + (iv.score || iv.overallScore || 0), 0) / interviews.length)
    : 0;

  return (
    <AdminLayout title="Interview Sessions" subtitle={`${interviews.length} total sessions`}>
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Sessions',  value: interviews.length,             bg: 'bg-blue-500/10 border-blue-500/20',   color: 'text-blue-400' },
          { label: 'Avg Score',       value: avgScore + '%',                bg: 'bg-green-500/10 border-green-500/20', color: 'text-green-400' },
          { label: 'High Scorers',    value: interviews.filter(iv => (iv.score || iv.overallScore || 0) >= 80).length, bg: 'bg-purple-500/10 border-purple-500/20', color: 'text-purple-400' },
          { label: 'Needs Practice',  value: interviews.filter(iv => (iv.score || iv.overallScore || 0) < 60).length, bg: 'bg-red-500/10 border-red-500/20',    color: 'text-red-400' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`glass-card p-4 border ${bg}`}>
            <p className="section-label mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          className="input-field max-w-xs"
          placeholder="🔍  Search by user or job..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="text-slate-500 text-sm self-center ml-auto">{filtered.length} results</span>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">🎤</div>
          <p className="text-white font-semibold text-lg mb-2">No Interview Sessions Yet</p>
          <p className="text-slate-500 text-sm">Interview data will appear here once users complete sessions.</p>
          <p className="text-slate-600 text-xs mt-2">Data stored in Firestore <code>interviews</code> collection</p>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border bg-admin-hover/50">
                    <th className="table-header text-left py-3 px-4">User</th>
                    <th className="table-header text-left py-3 px-4">Job Title</th>
                    <th className="table-header text-left py-3 px-4">Score</th>
                    <th className="table-header text-left py-3 px-4 hidden md:table-cell">Date</th>
                    <th className="table-header text-left py-3 px-4">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(iv => {
                    const score = iv.score || iv.overallScore || 0;
                    return (
                      <tr key={iv.id} className="table-row cursor-pointer" onClick={() => setSelected(iv)}>
                        <td className="table-cell text-xs text-slate-400">{getUserEmail(iv.userId || iv.uid)}</td>
                        <td className="table-cell text-white text-sm">{iv.jobTitle || 'General Interview'}</td>
                        <td className="table-cell">
                          <span className={`badge ${scoreBadge(score)}`}>{score}%</span>
                        </td>
                        <td className="table-cell hidden md:table-cell text-slate-400 text-xs">
                          {iv.createdAt ? new Date(iv.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="table-cell">
                          <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold">View →</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selected && (
            <div className="lg:w-80 glass-card p-6 animate-slide-in flex-shrink-0 self-start">
              <div className="flex items-center justify-between mb-5">
                <p className="text-white font-semibold">Session Details</p>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg">✕</button>
              </div>
              <div className="text-center mb-5">
                <div className={`text-5xl font-black mb-1 ${scoreColor(selected.score || selected.overallScore || 0)}`}>
                  {selected.score || selected.overallScore || 0}%
                </div>
                <p className="text-slate-500 text-xs">Interview Score</p>
              </div>
              {selected.feedback && (
                <div className="bg-admin-hover rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">AI Feedback</p>
                  <p className="text-slate-300 text-xs leading-relaxed">{selected.feedback}</p>
                </div>
              )}
              {selected.questions && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Q&A ({selected.questions.length} questions)</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selected.questions.map((q, i) => (
                      <div key={i} className="text-xs bg-admin-hover rounded-lg p-2">
                        <p className="text-brand-400 font-medium mb-1">Q: {q.question || q.q}</p>
                        <p className="text-slate-400">{q.answer || q.a || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
