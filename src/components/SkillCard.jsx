export default function SkillCard({ analysis }) {
  if (!analysis || !analysis.atsScore) return null;

  const { atsScore, profileScore, skills } = analysis;
  
  const getGrade = (score) => {
    if(score >= 90) return { letter: 'A', color: 'bg-green-100 text-green-800' };
    if(score >= 80) return { letter: 'B', color: 'bg-blue-100 text-blue-800' };
    if(score >= 70) return { letter: 'C', color: 'bg-yellow-100 text-yellow-800' };
    if(score >= 60) return { letter: 'D', color: 'bg-orange-100 text-orange-800' };
    return { letter: 'F', color: 'bg-red-100 text-red-800' };
  };

  const grade = getGrade(atsScore.total);

  const ProgressBar = ({ label, value }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-medium mb-1 text-gray-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${value}%`}}></div>
      </div>
    </div>
  );

  return (
    <div className="glass-card overflow-hidden">
      {/* Header Cards (2 Col) */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-gray-100">
        <div className="p-6 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Overall Profile Score</p>
          <div className="mt-4 flex items-center justify-center">
            <span className="text-5xl font-extrabold text-brand-600">{profileScore}</span><span className="text-2xl text-gray-400">/100</span>
          </div>
        </div>
        <div className="p-6 text-center relative">
           <div className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${grade.color}`}>
             {grade.letter}
           </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Estimated ATS Score</p>
          <div className="mt-4 flex items-center justify-center">
            <span className="text-5xl font-extrabold text-gray-900">{atsScore.total}</span><span className="text-2xl text-gray-400">/100</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-10">
        {/* Left Column: Dimensions */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">ATS Dimensions</h3>
          <ProgressBar label="Readability & Tone" value={atsScore.readability} />
          <ProgressBar label="Keyword Match" value={atsScore.keywords} />
          <ProgressBar label="Impact & Results" value={atsScore.impact} />
          <ProgressBar label="Formatting" value={atsScore.formatting} />
          <ProgressBar label="Brevity" value={atsScore.brevity} />
          <ProgressBar label="Grammar & Spelling" value={atsScore.grammar} />
        </div>

        {/* Right Column: Skills */}
        <div>
           <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Extracted Match Data</h3>
           
           <div className="mb-6">
             <h4 className="text-sm font-semibold text-gray-500 mb-3">Technical Skills</h4>
             <div className="flex flex-wrap gap-2">
               {skills.technical?.length ? skills.technical.map(skill => (
                 <span key={skill} className="px-3 py-1 bg-brand-50 text-brand-700 text-sm rounded-full font-medium border border-brand-100">{skill}</span>
               )) : <span className="text-gray-400 text-sm">None detected</span>}
             </div>
           </div>

           <div className="mb-6">
             <h4 className="text-sm font-semibold text-gray-500 mb-3">Tools & Frameworks</h4>
             <div className="flex flex-wrap gap-2">
               {skills.tools?.length ? skills.tools.map(skill => (
                 <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full font-medium border border-indigo-100">{skill}</span>
               )) : <span className="text-gray-400 text-sm">None detected</span>}
             </div>
           </div>

           <div>
             <h4 className="text-sm font-semibold text-gray-500 mb-3">Soft Skills</h4>
             <div className="flex flex-wrap gap-2">
               {skills.soft?.length ? skills.soft.map(skill => (
                 <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium border border-gray-200">{skill}</span>
               )) : <span className="text-gray-400 text-sm">None detected</span>}
             </div>
           </div>
        </div>
      </div>
      
      {/* Professional Summary Extracted */}
      {analysis.summary && (
        <div className="bg-gray-50 p-6 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Summary</h4>
          <p className="text-gray-700 italic">"{analysis.summary}"</p>
        </div>
      )}
    </div>
  );
}
