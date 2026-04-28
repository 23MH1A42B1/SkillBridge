import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAuditLogs } from '../services/adminService';

export default function AuditLogPage() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAuditLogs(100).then(setLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !search ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.adminEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const actionColor = (action = '') => {
    if (action.includes('disabled') || action.includes('deleted')) return 'badge-red';
    if (action.includes('enabled') || action.includes('created'))  return 'badge-green';
    if (action.includes('config') || action.includes('updated'))   return 'badge-blue';
    if (action.includes('Role'))  return 'badge-purple';
    return 'badge-yellow';
  };

  if (loading) return (
    <AdminLayout title="Audit Log" subtitle="Admin activity trail">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Audit Log" subtitle="Admin activity trail — all actions are logged">
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          className="input-field max-w-xs"
          placeholder="🔍  Search logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="text-slate-500 text-sm self-center ml-auto">{filtered.length} entries</span>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-white font-semibold text-lg mb-2">No Audit Logs Yet</p>
          <p className="text-slate-500 text-sm">Actions taken in the admin portal will be recorded here.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border bg-admin-hover/50">
                  <th className="table-header text-left py-3 px-4">Timestamp</th>
                  <th className="table-header text-left py-3 px-4">Admin</th>
                  <th className="table-header text-left py-3 px-4">Action</th>
                  <th className="table-header text-left py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="table-row">
                    <td className="table-cell text-slate-400 text-xs whitespace-nowrap">
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="table-cell text-slate-300 text-xs">{l.adminEmail}</td>
                    <td className="table-cell">
                      <span className={`badge ${actionColor(l.action)}`}>{l.action}</span>
                    </td>
                    <td className="table-cell text-slate-500 text-xs font-mono">
                      {l.details ? JSON.stringify(l.details).slice(0, 80) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
