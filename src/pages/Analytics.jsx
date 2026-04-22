import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getApplications, STAGES } from '../services/applicationService';
import { getUserSkills } from '../services/resumeService';
import AppLayout from '../components/AppLayout';

export default function Analytics() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [skills, setSkills] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [appData, skillData] = await Promise.all([
          getApplications(user.uid),
          getUserSkills(user.uid)
        ]);
        setApps(appData);
        setSkills(skillData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const stats = STAGES.map(s => ({
    label: s.title,
    count: apps.filter(a => a.stage === s.id).length,
    color: s.color.split(' ')[0]
  }));

  const totalApps = apps.length;

  return (
    <AppLayout>
        <header className="mb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Career Analytics</h1>
                    <p className="text-gray-500 font-medium">Data-driven insights into your job search performance.</p>
                </div>
                <a href="/career-report" className="btn-primary py-3 px-8 rounded-full shadow-neon-glow flex items-center gap-2">
                    📊 Generate Executive Report
                </a>
            </div>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="bg-dark-card border border-white/5 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Apps</p>
                  <p className="text-4xl font-black text-white">{totalApps}</p>
               </div>
               <div className="bg-dark-card border border-white/5 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Interview Rate</p>
                  <p className="text-4xl font-black text-indigo-400">
                    {totalApps > 0 ? Math.round((apps.filter(a => a.stage === 'interviewing').length / totalApps) * 100) : 0}%
                  </p>
               </div>
               <div className="bg-dark-card border border-white/5 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">ATS Average</p>
                  <p className="text-4xl font-black text-brand-400">{skills?.atsScore?.total || '--'}</p>
               </div>
               <div className="bg-dark-card border border-white/5 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Skills Found</p>
                  <p className="text-4xl font-black text-violet-400">{skills?.skills?.technical?.length || 0}</p>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               {/* Funnel Visualization */}
               <div className="bg-dark-card border border-white/5 p-10 rounded-[2.5rem]">
                  <h3 className="text-white font-black text-xl mb-8 uppercase tracking-tight">Application Pipeline</h3>
                  <div className="space-y-6">
                    {stats.map(s => (
                      <div key={s.label}>
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                            <span>{s.label}</span>
                            <span className="text-white">{s.count}</span>
                         </div>
                         <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${s.color} transition-all duration-1000`} 
                              style={{ width: totalApps > 0 ? `${(s.count / totalApps) * 100}%` : '0%' }}
                            />
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Top Skills Heatmap */}
               <div className="bg-dark-card border border-white/5 p-10 rounded-[2.5rem]">
                  <h3 className="text-white font-black text-xl mb-8 uppercase tracking-tight">Profile Strength</h3>
                  <div className="flex flex-wrap gap-3">
                    {skills?.skills?.technical?.map((s, i) => (
                      <span 
                        key={s} 
                        className="px-4 py-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl text-xs font-bold"
                        style={{ opacity: 1 - i * 0.05 }}
                      >
                        {s}
                      </span>
                    ))}
                    {(!skills?.skills?.technical?.length) && (
                      <p className="text-gray-600 italic">No skills analyzed yet.</p>
                    )}
                  </div>
               </div>
            </div>
            
            {/* Recommendations */}
            <div className="bg-gradient-to-br from-brand-600/10 to-indigo-600/10 border border-brand-500/20 p-10 rounded-[2.5rem] text-center">
               <h3 className="text-white font-black text-2xl mb-4">AI Insight</h3>
               <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                 {totalApps === 0 ? "Start tracking your applications to see AI career insights here!" : 
                  apps.filter(a => a.stage === 'rejected').length > totalApps / 2 ? 
                  "We noticed a high rejection rate. Consider using the 'Resume Tailoring' tool more frequently to align with job keywords." :
                  "Your profile looks strong! Keep using the 'AI Interview Prep' for your upcoming interviewing stage applications."}
               </p>
            </div>
          </div>
        )}
    </AppLayout>
  );
}
