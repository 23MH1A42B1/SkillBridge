import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllUsers, getAllUserSkills, updateUserStatus, updateUserRole, logAdminAction } from '../services/adminService';
import { createImpersonationToken } from '../services/impersonateService';
import { downloadCSV } from '../utils/exportUtils';
import { useAdminAuth } from '../auth/AdminAuthContext';

export default function UsersPage() {
  const { admin } = useAdminAuth();
  const [users, setUsers]     = useState([]);
  const [skills, setSkills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [actionBusy, setActionBusy] = useState('');
  const [toast, setToast]     = useState('');

  useEffect(() => {
    Promise.all([getAllUsers(), getAllUserSkills()])
      .then(([u, s]) => { setUsers(u); setSkills(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ||
      (filter === 'active' && u.status !== 'disabled') ||
      (filter === 'disabled' && u.status === 'disabled') ||
      (filter === 'flagged' && skills.find(s => s.userId === (u.uid || u.id))?.spamAnalysis?.isJunk) ||
      (filter === 'resume' && skills.find(s => s.userId === (u.uid || u.id)));
    return matchSearch && matchFilter;
  });

  const handleDisable = async (u) => {
    setActionBusy(u.uid || u.id);
    const newStatus = u.status === 'disabled' ? 'active' : 'disabled';
    await updateUserStatus(u.uid || u.id, newStatus);
    await logAdminAction(admin.email, `User ${newStatus}`, { userId: u.uid || u.id, email: u.email });
    setUsers(prev => prev.map(x => (x.uid || x.id) === (u.uid || u.id) ? { ...x, status: newStatus } : x));
    if (selected?.uid === u.uid) setSelected(p => ({ ...p, status: newStatus }));
    setActionBusy('');
    showToast(`User ${newStatus === 'disabled' ? 'disabled' : 'enabled'} successfully`);
  };

  const handleRoleToggle = async (u) => {
    setActionBusy('role-' + (u.uid || u.id));
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    await updateUserRole(u.uid || u.id, newRole);
    await logAdminAction(admin.email, `Role changed to ${newRole}`, { userId: u.uid || u.id });
    setUsers(prev => prev.map(x => (x.uid || x.id) === (u.uid || u.id) ? { ...x, role: newRole } : x));
    setActionBusy('');
    showToast(`Role updated to ${newRole}`);
  };

  const handleImpersonate = async (u) => {
    setActionBusy('impersonate-' + (u.uid || u.id));
    try {
      const token = await createImpersonationToken(admin.email, u.uid || u.id);
      window.open(`http://localhost:5173/dashboard?impersonate=${token}`, '_blank');
      showToast(`Impersonating ${u.email}...`);
    } catch (e) {
      showToast('❌ Failed to impersonate');
      console.error(e);
    }
    setActionBusy('');
  };

  const getResume = (uid) => skills.find(s => s.userId === uid);

  const handleExportCSV = () => {
    const dataToExport = filtered.map(u => {
      const resume = getResume(u.uid || u.id);
      return {
        'User ID': u.uid || u.id,
        'Name': u.fullName || u.displayName || 'Unknown',
        'Email': u.email || '',
        'Role': u.role || 'user',
        'Status': u.status || 'active',
        'Joined At': u.createdAt ? new Date(u.createdAt).toLocaleString() : '',
        'Has Resume': resume ? 'Yes' : 'No',
        'ATS Score': resume?.atsScore?.total || 0,
        'Experience (Yrs)': resume?.experienceYears || 0
      };
    });
    downloadCSV(`SkillBridge_Users_${new Date().toISOString().split('T')[0]}.csv`, dataToExport);
    showToast('📥 CSV Downloaded!');
  };

  if (loading) return (
    <AdminLayout title="Users" subtitle="Manage registered users">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="User Management" subtitle={`${users.length} registered users`}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in shadow-lg">
          ✓ {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table side */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              className="input-field max-w-xs"
              placeholder="🔍  Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="user-search"
            />
            <div className="flex gap-2 flex-wrap">
              {['all','active','disabled','flagged','resume'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    filter === f
                      ? 'bg-brand-500 text-white'
                      : 'bg-admin-hover border border-admin-border text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'flagged' ? '⚠️ Flagged' : f === 'resume' ? 'Has Resume' : f}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-slate-500 text-sm hidden sm:block">{filtered.length} results</span>
              <button 
                onClick={handleExportCSV}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-2"
              >
                <span>📥</span> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border bg-admin-hover/50">
                    <th className="table-header text-left py-3 px-4">User</th>
                    <th className="table-header text-left py-3 px-4 hidden md:table-cell">Joined</th>
                    <th className="table-header text-left py-3 px-4 hidden lg:table-cell">Resume</th>
                    <th className="table-header text-left py-3 px-4">Status</th>
                    <th className="table-header text-left py-3 px-4">Role</th>
                    <th className="table-header text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const uid = u.uid || u.id;
                    const resume = getResume(uid);
                    return (
                      <tr
                        key={uid}
                        className={`table-row cursor-pointer ${selected?.uid === u.uid ? 'bg-brand-500/5' : ''}`}
                        onClick={() => setSelected(u)}
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400 flex-shrink-0">
                              {(u.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white text-sm font-medium">{u.fullName || u.displayName || 'Unknown'}</p>
                                {resume?.spamAnalysis?.isJunk && (
                                  <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse">🚩 JUNK</span>
                                )}
                              </div>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell hidden md:table-cell text-slate-400 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="table-cell hidden lg:table-cell">
                          {resume
                            ? <span className="badge badge-green">✓ Yes ({resume.atsScore?.total || 0}%)</span>
                            : <span className="badge badge-yellow">None</span>
                          }
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${u.status === 'disabled' ? 'badge-red' : 'badge-green'}`}>
                            {u.status === 'disabled' ? '⛔ Disabled' : '✓ Active'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                            {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>
                        <td className="table-cell" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDisable(u)}
                              disabled={actionBusy === uid}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                                u.status === 'disabled'
                                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              {actionBusy === uid ? '...' : u.status === 'disabled' ? 'Enable' : 'Disable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-slate-500 py-12 text-sm">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User detail drawer */}
        {selected && (
          <div className="lg:w-80 glass-card p-6 animate-slide-in flex-shrink-0 self-start sticky top-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-white font-semibold">User Details</p>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg transition-colors">✕</button>
            </div>

            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center text-2xl font-bold text-brand-400 mx-auto mb-3">
                {(selected.email || '?')[0].toUpperCase()}
              </div>
              <p className="text-white font-semibold">{selected.fullName || selected.displayName || 'Unknown'}</p>
              <p className="text-slate-500 text-xs mt-0.5">{selected.email}</p>
              <div className="flex gap-2 justify-center mt-3">
                <span className={`badge ${selected.status === 'disabled' ? 'badge-red' : 'badge-green'}`}>
                  {selected.status === 'disabled' ? 'Disabled' : 'Active'}
                </span>
                <span className={`badge ${selected.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                  {selected.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: 'UID',       value: (selected.uid || selected.id)?.slice(0, 16) + '…' },
                { label: 'Joined',    value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—' },
                { label: 'Last Login',value: selected.lastLogin ? new Date(selected.lastLogin).toLocaleDateString() : '—' },
                { label: 'Provider',  value: selected.provider || 'Email/Password' },
                { label: 'Target Role',value: selected.desiredRole || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-admin-border last:border-0">
                  <span className="text-slate-500 text-xs">{label}</span>
                  <span className="text-white text-xs font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Resume info */}
            {(() => {
              const resume = getResume(selected.uid || selected.id);
              return resume ? (
                <div className="bg-admin-hover rounded-xl p-3 mb-5">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Resume Data</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">ATS Score</span>
                      <span className="text-white font-bold">{resume.atsScore?.total || 0}/100</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Skills</span>
                      <span className="text-white">{(resume.skills?.technical?.length || 0) + (resume.skills?.tools?.length || 0)} total</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Experience</span>
                      <span className="text-white">{resume.experienceYears || '—'} yrs</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-5">
                  <p className="text-yellow-400 text-xs">No resume uploaded yet</p>
                </div>
              );
            })()}

            <div className="space-y-2">
              <button
                onClick={() => handleImpersonate(selected)}
                disabled={actionBusy.startsWith('impersonate')}
                className="btn-primary w-full justify-center bg-indigo-500 hover:bg-indigo-600 border-indigo-500/50"
              >
                👀 Impersonate User
              </button>
              <button
                onClick={() => handleDisable(selected)}
                className={selected.status === 'disabled' ? 'btn-success w-full justify-center' : 'btn-danger w-full justify-center'}
              >
                {selected.status === 'disabled' ? '✓ Enable Account' : '⛔ Disable Account'}
              </button>
              <button
                onClick={() => handleRoleToggle(selected)}
                disabled={actionBusy.startsWith('role')}
                className="btn-secondary w-full justify-center"
              >
                {selected.role === 'admin' ? '👤 Remove Admin' : '👑 Make Admin'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
