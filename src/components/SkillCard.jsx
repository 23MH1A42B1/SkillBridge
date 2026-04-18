import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function SkillCard({ analysis }) {
  if (!analysis || !analysis.atsScore) return null;

  const { atsScore, profileScore, skills } = analysis;
  
  const getGrade = (score) => {
    if(score >= 90) return { letter: 'A', color: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-neon-glow' };
    if(score >= 80) return { letter: 'B', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    if(score >= 70) return { letter: 'C', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if(score >= 60) return { letter: 'D', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return { letter: 'F', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
  };

  const grade = getGrade(atsScore.total);

  const radarData = [
    { subject: 'Readability', score: atsScore.readability, fullMark: 100 },
    { subject: 'Keywords', score: atsScore.keywords, fullMark: 100 },
    { subject: 'Impact', score: atsScore.impact, fullMark: 100 },
    { subject: 'Formatting', score: atsScore.formatting, fullMark: 100 },
    { subject: 'Brevity', score: atsScore.brevity, fullMark: 100 },
    { subject: 'Grammar', score: atsScore.grammar, fullMark: 100 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-bg/90 backdrop-blur-md border border-brand-500/30 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{payload[0].payload.subject}</p>
          <p className="text-xl font-black text-brand-400">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header Cards (2 Col) */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 border-b border-white/5">
        <div className="p-10 text-center group">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 group-hover:text-brand-400 transition-colors">Profile Completeness</p>
          <div className="flex items-center justify-center">
            <span className="text-6xl font-black text-white tracking-tighter">{profileScore}</span>
            <span className="text-2xl text-gray-700 font-bold ml-1">/100</span>
          </div>
        </div>
        <div className="p-10 text-center relative group">
           <div className={`absolute top-10 right-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border ${grade.color}`}>
             {grade.letter}
           </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 group-hover:text-brand-400 transition-colors">Estimated ATS Score</p>
          <div className="flex items-center justify-center">
            <span className="text-6xl font-black text-white tracking-tighter">{atsScore.total}</span>
            <span className="text-2xl text-gray-700 font-bold ml-1">/100</span>
          </div>
        </div>
      </div>

      <div className="p-10 grid md:grid-cols-2 gap-16">
        {/* Left Column: Dimensions (Radar Chart) */}
        <div>
          <h3 className="text-xs font-black text-white mb-6 border-b border-white/5 pb-3 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-neon-purple"></span>
            ATS Core Analysis
          </h3>
          
          <div className="h-[300px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  fill="#6366f1" 
                  fillOpacity={0.3} 
                  activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#030014', strokeWidth: 2 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Skills */}
        <div>
           <h3 className="text-xs font-black text-white mb-8 border-b border-white/5 pb-3 uppercase tracking-[0.2em] flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
             Strategic Skill Map
           </h3>
           
           <div className="mb-8">
             <h4 className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-widest">Technical Skills</h4>
             <div className="flex flex-wrap gap-2">
               {skills.technical?.length ? skills.technical.map(skill => (
                 <span key={skill} className="px-3 py-1.5 bg-brand-500/10 text-brand-400 text-xs rounded-xl font-bold border border-brand-500/20">{skill}</span>
               )) : <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">None detected</span>}
             </div>
           </div>

           <div className="mb-8">
             <h4 className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-widest">Tools & Frameworks</h4>
             <div className="flex flex-wrap gap-2">
               {skills.tools?.length ? skills.tools.map(skill => (
                 <span key={skill} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 text-xs rounded-xl font-bold border border-indigo-500/20">{skill}</span>
               )) : <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">None detected</span>}
             </div>
           </div>

           <div>
             <h4 className="text-[10px] font-black text-gray-600 mb-4 uppercase tracking-widest">Soft Skills</h4>
             <div className="flex flex-wrap gap-2">
               {skills.soft?.length ? skills.soft.map(skill => (
                 <span key={skill} className="px-3 py-1.5 bg-white/5 text-gray-400 text-xs rounded-xl font-bold border border-white/5">{skill}</span>
               )) : <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">None detected</span>}
             </div>
           </div>
        </div>
      </div>
      
      {/* Professional Summary Extracted */}
      {analysis.summary && (
        <div className="bg-white/5 p-10 border-t border-white/5">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">AI Candidate Narrative</h4>
          <p className="text-gray-300 italic text-lg leading-relaxed font-medium">"{analysis.summary}"</p>
        </div>
      )}
    </div>
  );
}
