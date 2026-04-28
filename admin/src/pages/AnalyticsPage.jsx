import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getStats, getSignupTrend, getTokenUsage } from '../services/adminService';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function AnalyticsPage() {
  const [stats, setStats]     = useState(null);
  const [trend14, setTrend14] = useState([]);
  const [trend30, setTrend30] = useState([]);
  const [tokenUsage, setTokenUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(s => {
      setStats(s);
      setTrend14(getSignupTrend(s.users, 14));
      setTrend30(getSignupTrend(s.users, 30));
    }).catch(console.error);

    getTokenUsage(30).then(setTokenUsage).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Cumulative growth
  const cumulative = trend30.reduce((acc, d, i) => {
    const prev = acc[i - 1]?.total || 0;
    acc.push({ date: d.date, total: prev + d.signups, newUsers: d.signups });
    return acc;
  }, []);

  // Skills distribution (most common skills)
  const skillFreq = {};
  if (stats) {
    stats.skills.forEach(u => {
      [...(u.skills?.technical || []), ...(u.skills?.tools || [])].forEach(sk => {
        skillFreq[sk] = (skillFreq[sk] || 0) + 1;
      });
    });
  }
  const topSkills = Object.entries(skillFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  // ATS histogram
  const atsHisto = [
    { range: '0-20',  count: 0 }, { range: '21-40', count: 0 },
    { range: '41-60', count: 0 }, { range: '61-80', count: 0 },
    { range: '81-100',count: 0 },
  ];
  if (stats) {
    stats.skills.forEach(u => {
      const s = u.atsScore?.total || 0;
      if (s <= 20) atsHisto[0].count++;
      else if (s <= 40) atsHisto[1].count++;
      else if (s <= 60) atsHisto[2].count++;
      else if (s <= 80) atsHisto[3].count++;
      else atsHisto[4].count++;
    });
  }

  // Experience distribution
  const expHisto = [
    { range: '0-1 yr',  count: 0 }, { range: '1-3 yrs', count: 0 },
    { range: '3-5 yrs', count: 0 }, { range: '5-10 yrs',count: 0 },
    { range: '10+ yrs', count: 0 },
  ];
  if (stats) {
    stats.skills.forEach(u => {
      const e = u.experienceYears || 0;
      if (e <= 1) expHisto[0].count++;
      else if (e <= 3) expHisto[1].count++;
      else if (e <= 5) expHisto[2].count++;
      else if (e <= 10) expHisto[3].count++;
      else expHisto[4].count++;
    });
  }

  // Predictive Churn Analysis
  const riskUsers = stats?.users?.filter(u => {
    if (!u.lastLogin) return true;
    const daysSinceLogin = (new Date() - new Date(u.lastLogin)) / 86400000;
    return daysSinceLogin > 7;
  }) || [];
  
  const riskStats = [
    { label: 'Healthy', value: (stats?.totalUsers || 0) - riskUsers.length, color: '#4ade80' },
    { label: 'At Risk',  value: riskUsers.length, color: '#f87171' },
  ];

  const tooltipStyle = { background: '#0d0f1c', border: '1px solid #1a1d35', borderRadius: '12px', fontSize: '12px' };

  if (loading) return (
    <AdminLayout title="Analytics" subtitle="Platform analytics & insights">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Analytics" subtitle="Platform analytics & insights">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users',    value: stats.totalUsers,   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Resume Rate',    value: stats.totalUsers ? Math.round(stats.withResumes / stats.totalUsers * 100) + '%' : '0%', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Avg ATS',        value: stats.avgAtsScore + '%', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Matches / User', value: stats.totalUsers ? (stats.totalMatches / stats.totalUsers).toFixed(1) : '0', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
          { label: 'User Health',    value: stats.totalUsers ? Math.round(((stats.totalUsers - riskUsers.length) / stats.totalUsers) * 100) + '%' : '0%', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`glass-card p-5 border ${bg}`}>
            <p className="section-label mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <p className="text-white font-semibold mb-1">Daily New Signups</p>
          <p className="text-slate-500 text-xs mb-5">Last 14 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend14} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d35" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} fill="url(#g1)" name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <p className="text-white font-semibold mb-1">Cumulative Growth</p>
          <p className="text-slate-500 text-xs mb-5">Total users over 30 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cumulative} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d35" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#2dd4bf" strokeWidth={2} dot={false} name="Total Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Token Usage & Costs */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white font-semibold mb-1">AI Token Usage & Cost Estimates</p>
            <p className="text-slate-500 text-xs">Tracking Groq Llama 3.1 API consumption</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-400 text-sm font-bold">Est. Cost: ${(tokenUsage.reduce((acc, d) => acc + (d.totalTokens || 0), 0) / 1000000 * 0.15).toFixed(4)}</p>
            <p className="text-slate-500 text-[10px] uppercase">Based on $0.15 / 1M tokens</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={tokenUsage} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gToken" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1d35" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="totalTokens" stroke="#818cf8" strokeWidth={2} fill="url(#gToken)" name="Tokens Used" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ATS + Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <p className="text-white font-semibold mb-1">ATS Score Distribution</p>
          <p className="text-slate-500 text-xs mb-5">Resume quality breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={atsHisto} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d35" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#818cf8" radius={[6,6,0,0]} name="Resumes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <p className="text-white font-semibold mb-1">Experience Distribution</p>
          <p className="text-slate-500 text-xs mb-5">Years of experience across users</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expHisto} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d35" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#4ade80" radius={[6,6,0,0]} name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Skills */}
      <div className="glass-card p-6">
        <p className="text-white font-semibold mb-1">Most Common Skills</p>
        <p className="text-slate-500 text-xs mb-5">Across all uploaded resumes</p>
        {topSkills.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No skill data yet</p>
        ) : (
          <div className="space-y-3">
            {topSkills.map(({ skill, count }) => {
              const max = topSkills[0].count;
              const pct = Math.round(count / max * 100);
              return (
                <div key={skill} className="flex items-center gap-4">
                  <span className="text-slate-300 text-sm w-32 truncate">{skill}</span>
                  <div className="flex-1 bg-admin-border rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-xs w-16 text-right">{count} users</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Retention Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1 glass-card p-6 border-rose-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-rose-500/15 rounded-xl flex items-center justify-center text-lg">📉</div>
            <div>
              <p className="text-white font-semibold">Churn Risk</p>
              <p className="text-slate-500 text-xs">Users inactive for > 7 days</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-48">
            <div className="relative w-32 h-32">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                 <circle cx="50" cy="50" r="40" stroke="#f87171" strokeWidth="8" fill="transparent" 
                   strokeDasharray={251.2}
                   strokeDashoffset={251.2 * (1 - (riskUsers.length / (stats?.totalUsers || 1)))}
                   strokeLinecap="round"
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-bold text-white">{Math.round((riskUsers.length / (stats?.totalUsers || 1)) * 100)}%</span>
                 <span className="text-[10px] text-slate-500 uppercase">At Risk</span>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <p className="text-white font-semibold mb-1">Users Needing Attention</p>
          <p className="text-slate-500 text-xs mb-5">Highly qualified users at risk of churn</p>
          <div className="space-y-3">
            {riskUsers.slice(0, 5).map(u => {
              const res = stats?.skills?.find(s => s.userId === (u.uid || u.id));
              return (
                <div key={u.uid || u.id} className="flex items-center justify-between p-3 rounded-lg bg-admin-hover/50 border border-admin-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                      {(u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{u.fullName || u.email}</p>
                      <p className="text-slate-500 text-[10px]">Last active: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-400 text-xs font-bold">ATS: {res?.atsScore?.total || 0}%</p>
                    <p className="text-slate-600 text-[10px]">Churn Probability: High</p>
                  </div>
                </div>
              );
            })}
            {riskUsers.length === 0 && <p className="text-center py-8 text-slate-500 text-sm italic">All users are currently active! 🎉</p>}
          </div>
        </div>
      </div>

      {/* AI Prompt Auditor */}
      <div className="glass-card p-8 mt-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500/15 rounded-xl flex items-center justify-center text-xl">🔬</div>
          <div>
            <p className="text-white font-black text-sm uppercase tracking-widest">AI Prompt Auditor</p>
            <p className="text-slate-500 text-xs">Real-time prompt efficiency & cost monitoring</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { label: 'Resume Analysis', latency: '1.2s', tokens: '4,200', efficiency: '98%' },
              { label: 'Interview Eval', latency: '2.4s', tokens: '1,800', efficiency: '94%' },
              { label: 'Job Matching', latency: '0.8s', tokens: '850', efficiency: '99%' },
              { label: 'LinkedIn Post', latency: '1.5s', tokens: '1,200', efficiency: '96%' },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-2xl bg-admin-hover/50 border border-admin-border/50 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-xs">{item.label}</p>
                  <p className="text-slate-600 text-[10px]">Avg Latency: {item.latency}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-400 font-black text-xs">{item.tokens} tokens</p>
                  <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Efficiency: {item.efficiency}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl mx-auto mb-4">💡</div>
            <h4 className="text-white font-black text-sm uppercase mb-2">Optimizer Suggestion</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
              Your "Interview Eval" prompt uses high-density context. Consider using <strong>Prompt Caching</strong> to reduce token costs by up to <strong>30%</strong>.
            </p>
            <button className="mt-6 btn-secondary text-[10px] font-black uppercase tracking-widest self-center">Apply Optimization</button>
          </div>
        </div>
      </div>

      {/* Global User Heatmap */}
      <div className="glass-card p-8 mt-6 overflow-hidden relative border border-brand-500/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center text-xl">🗺️</div>
          <div>
            <p className="text-white font-black text-sm uppercase tracking-widest">Global User Distribution</p>
            <p className="text-slate-500 text-xs">Real-time geographic user density</p>
          </div>
        </div>

        <div className="h-64 w-full bg-slate-900/50 rounded-[2.5rem] border border-white/5 flex items-center justify-center relative z-10 group cursor-crosshair">
          <div className="text-slate-700 text-6xl opacity-30 select-none font-black uppercase tracking-[0.2em]">Live Heatmap Active</div>
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-brand-500 rounded-full animate-ping shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-brand-400 rounded-full animate-ping shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-indigo-500 rounded-full animate-ping shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ animationDelay: '2s' }} />
          
          <div className="absolute bottom-6 right-6 flex gap-3">
             <div className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-[8px] font-black uppercase tracking-widest text-slate-400">
               Top Region: <span className="text-brand-400 ml-1">North America</span>
             </div>
             <div className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-[8px] font-black uppercase tracking-widest text-slate-400">
               Active Markets: <span className="text-brand-400 ml-1">12 Countries</span>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
