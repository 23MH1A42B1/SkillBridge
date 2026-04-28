import React from 'react';

export default function StatCard({ label, value, icon, color = 'blue', trend, sub }) {
  const colors = {
    blue:   { bg: 'from-blue-500/10 to-indigo-500/5',   border: 'border-blue-500/15',   icon: 'bg-blue-500/15 text-blue-400',   glow: 'glow-blue',   bar: 'bg-blue-500' },
    green:  { bg: 'from-green-500/10 to-emerald-500/5', border: 'border-green-500/15',  icon: 'bg-green-500/15 text-green-400', glow: 'glow-green',  bar: 'bg-green-500' },
    purple: { bg: 'from-purple-500/10 to-violet-500/5', border: 'border-purple-500/15', icon: 'bg-purple-500/15 text-purple-400', glow: 'glow-purple', bar: 'bg-purple-500' },
    teal:   { bg: 'from-teal-500/10 to-cyan-500/5',     border: 'border-teal-500/15',   icon: 'bg-teal-500/15 text-teal-400',   glow: 'glow-teal',   bar: 'bg-teal-400' },
    orange: { bg: 'from-orange-500/10 to-red-500/5',    border: 'border-orange-500/15', icon: 'bg-orange-500/15 text-orange-400', glow: '', bar: 'bg-orange-500' },
    pink:   { bg: 'from-pink-500/10 to-rose-500/5',     border: 'border-pink-500/15',   icon: 'bg-pink-500/15 text-pink-400',   glow: '',            bar: 'bg-pink-500' },
  };
  const c = colors[color] || colors.blue;

  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-500';
  const trendIcon  = trend > 0 ? '↑' : trend < 0 ? '↓' : '—';

  return (
    <div className={`stat-card bg-gradient-to-br ${c.bg} border ${c.border} ${c.glow} animate-fade-in`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} text-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="section-label mb-1">{label}</p>
      <p className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
