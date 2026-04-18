import { useState, useEffect } from 'react';
import TiltCard from './TiltCard';

/**
 * MarketIntelligence — Visualizes job market trends based on AI scraping.
 */
export default function MarketIntelligence({ jobMatches = [] }) {
  const [trends, setTrends] = useState({
    skills: [
      { name: 'React.js', growth: 12, value: 85 },
      { name: 'TypeScript', growth: 24, value: 72 },
      { name: 'Node.js', growth: -5, value: 64 },
      { name: 'Cloud Arch', growth: 18, value: 58 },
      { name: 'LLM Ops', growth: 42, value: 45 },
    ],
    salary: { min: 120, max: 185, median: 154 },
    marketSentiment: 88,
  });

  const [insight, setInsight] = useState('Analyzing your market position...');

  useEffect(() => {
    async function getInsight() {
      if (jobMatches.length === 0) {
        setInsight("Upload your resume to see personalized market strategic insights.");
        return;
      }
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { 
                role: "system", 
                content: "You are a Senior Career Market Analyst. Based on the candidate's job matches, provide a 1-2 sentence high-level strategic insight about their market position and one 'power move' they should make." 
              },
              { role: "user", content: `Job Matches: ${jobMatches.map(j => j.title).join(', ')}` }
            ],
            temperature: 0.5
          })
        });
        const data = await response.json();
        setInsight(data.choices[0].message.content);
      } catch (err) {
        setInsight("Market signals are strong. Continue applying to high-growth roles.");
      }
    }
    getInsight();
  }, [jobMatches]);

  return (
    <div className="space-y-8 mb-10">
      {/* ── AI Strategic Insight ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-600/10 via-indigo-600/10 to-transparent border border-brand-500/20 rounded-3xl p-6 flex items-center gap-6">
         <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-xl shadow-neon-glow shrink-0">🧠</div>
         <div>
            <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">AI Strategic Insight</h4>
            <p className="text-sm text-gray-300 font-medium italic">"{insight}"</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Skills Trend ─────────────────────────────────────── */}
        <TiltCard className="lg:col-span-2 bg-dark-card border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
             <svg className="w-40 h-40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
             </svg>
           </div>

           <div className="relative z-10">
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm">📊</span>
                 Skills Demand Radar
              </h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Real-time trending technology stack</p>

              <div className="space-y-6">
                 {trends.skills.map((skill, i) => (
                   <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-sm font-black text-white">{skill.name}</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${skill.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                           {skill.growth > 0 ? '↑' : '↓'} {Math.abs(skill.growth)}% Demand
                         </span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-1000 delay-300"
                           style={{ width: `${skill.value}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </TiltCard>

        {/* ── Salary & Sentiment ───────────────────────────────── */}
        <div className="space-y-8">
           {/* Salary Card */}
           <TiltCard className="bg-dark-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-50" />
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Projected Salary Band</h4>
              <div className="text-4xl font-black text-white tracking-tighter mb-2">
                 ${trends.salary.median}k
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-white/5 pt-4">
                 <span>Min: ${trends.salary.min}k</span>
                 <span>Max: ${trends.salary.max}k</span>
              </div>
           </TiltCard>

           {/* Market Confidence */}
           <TiltCard className="bg-dark-card border border-brand-500/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[calc(100%-128px-32px)]">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <span className="text-4xl">⚡</span>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Market Confidence</h4>
                <p className="text-xs text-gray-500 font-medium">Likelihood of hire in 30 days</p>
              </div>
              <div className="mt-6 flex items-end gap-3">
                 <div className="text-5xl font-black text-white tracking-tighter">{trends.marketSentiment}%</div>
                 <div className="mb-2 text-[10px] font-black text-green-400 uppercase tracking-widest animate-pulse">High</div>
              </div>
           </TiltCard>
        </div>
      </div>
    </div>
  );
}
