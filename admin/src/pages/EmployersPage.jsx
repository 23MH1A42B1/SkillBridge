import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function EmployersPage() {
  const [employers, setEmployers] = useState([
    { id: 1, name: 'TechCorp', industry: 'Software', jobs: 12, status: 'Active', revenue: '$1,200' },
    { id: 2, name: 'GlobalFinance', industry: 'Banking', jobs: 5, status: 'Pending', revenue: '$0' },
    { id: 3, name: 'HealthPlus', industry: 'Healthcare', jobs: 8, status: 'Active', revenue: '$850' },
  ]);

  return (
    <AdminLayout title="Employer Management" subtitle="Manage recruiting partners and job postings">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Partners', value: '24', icon: '🏢', color: 'text-blue-400' },
          { label: 'Active Jobs', value: '142', icon: '💼', color: 'text-green-400' },
          { label: 'Partner Revenue', value: '$42,500', icon: '💰', color: 'text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-6 border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="section-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-admin-hover/50 border-b border-admin-border">
              <th className="p-4 section-label">Company</th>
              <th className="p-4 section-label">Industry</th>
              <th className="p-4 section-label">Jobs</th>
              <th className="p-4 section-label">Status</th>
              <th className="p-4 section-label">Revenue</th>
              <th className="p-4 section-label text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employers.map(emp => (
              <tr key={emp.id} className="border-b border-admin-border/50 hover:bg-admin-hover/30 transition-colors">
                <td className="p-4">
                  <p className="text-white font-bold text-sm">{emp.name}</p>
                  <p className="text-slate-500 text-[10px]">Partner ID: {emp.id * 1234}</p>
                </td>
                <td className="p-4 text-slate-400 text-sm">{emp.industry}</td>
                <td className="p-4 text-white font-medium text-sm">{emp.jobs}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    emp.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="p-4 text-white font-bold text-sm">{emp.revenue}</td>
                <td className="p-4 text-right">
                  <button className="text-brand-400 hover:text-white transition-colors text-xs font-bold uppercase mr-4">Edit</button>
                  <button className="text-red-400 hover:text-white transition-colors text-xs font-bold uppercase">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-between items-center bg-brand-500/5 p-6 rounded-3xl border border-brand-500/20">
        <div>
          <h3 className="text-white font-bold">Onboard New Partner</h3>
          <p className="text-slate-500 text-xs">Send an invitation to a company to start recruiting on SkillBridge.</p>
        </div>
        <button className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-neon-glow">
          Invite Employer →
        </button>
      </div>
    </AdminLayout>
  );
}
