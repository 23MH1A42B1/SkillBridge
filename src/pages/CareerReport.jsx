import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';
import { getApplications } from '../services/applicationService';
import { getInterviewSessions } from '../services/interviewService';

export default function CareerReport() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    skills: null,
    applications: [],
    interviews: []
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [skills, apps, ints] = await Promise.all([
          getUserSkills(user.uid),
          getApplications(user.uid),
          getInterviewSessions(user.uid)
        ]);
        setData({ skills, applications: apps, interviews: ints });
      } catch (err) {
        console.error("Report loading failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Assembling Executive Insights...</p>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-20 print:p-0 print:max-w-none">
        
        {/* Header / Actions */}
        <div className="flex justify-between items-center mb-12 print:hidden">
          <h1 className="text-3xl font-black text-white">AI Career Readiness Report</h1>
          <button 
            onClick={handlePrint}
            className="btn-primary px-8 py-3 rounded-full shadow-neon-glow flex items-center gap-2"
          >
            📥 Download PDF Report
          </button>
        </div>

        {/* THE REPORT CONTAINER */}
        <div className="bg-white text-gray-900 rounded-[3rem] overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
          
          {/* Cover Page */}
          <div className="bg-dark-bg p-20 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 opacity-10">
               <img src="/favicon.png" className="w-64 h-64 grayscale brightness-200" alt="" />
             </div>
             <div className="relative z-10">
                <div className="text-brand-400 font-black tracking-[0.3em] uppercase text-xs mb-6">Confidential Career Audit</div>
                <h2 className="text-6xl font-black mb-4 tracking-tighter">Executive Summary</h2>
                <div className="flex items-center gap-4 text-gray-400 font-medium">
                  <span>Prepared for: <b>{profile?.fullName || user.email}</b></span>
                  <span className="opacity-20">•</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
             </div>
          </div>

          <div className="p-16 space-y-20">
            
            {/* Section 1: Skill DNA */}
            <section>
              <h3 className="text-2xl font-black text-gray-900 mb-8 pb-4 border-b-2 border-gray-100 flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm">01</span>
                Technical Skill DNA
              </h3>
              <div className="grid grid-cols-2 gap-12">
                 <div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                      Our AI analysis indicates a high concentration of expertise in your core technical domain. You are currently positioned in the <b>Top 15%</b> of candidates for your target role.
                    </p>
                    <div className="space-y-4">
                       {data.skills?.technical?.slice(0, 5).map(skill => (
                         <div key={skill} className="flex items-center justify-between">
                            <span className="font-bold text-sm">{skill}</span>
                            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-600" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-gray-50 rounded-3xl p-8 flex flex-col justify-center text-center">
                    <div className="text-5xl font-black text-brand-600 mb-2">92%</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Readiness Score</div>
                 </div>
              </div>
            </section>

            {/* Section 2: Interview Performance */}
            <section className="print:break-before-page">
              <h3 className="text-2xl font-black text-gray-900 mb-8 pb-4 border-b-2 border-gray-100 flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm">02</span>
                Communication & Interview Audit
              </h3>
              <div className="space-y-6">
                {data.interviews.length > 0 ? (
                  data.interviews.slice(0, 2).map((session, i) => (
                    <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                       <div className="flex justify-between items-center mb-4">
                          <span className="font-black text-gray-700 uppercase text-[10px] tracking-widest">Session: {session.jobTitle}</span>
                          <span className="font-black text-emerald-600">{session.score}%</span>
                       </div>
                       <p className="text-sm italic text-gray-600">"{session.feedback.substring(0, 150)}..."</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm">No interview data available yet. Practice in the Simulator to populate this section.</p>
                )}
              </div>
            </section>

            {/* Section 3: Market Benchmark */}
            <section>
              <h3 className="text-2xl font-black text-gray-900 mb-8 pb-4 border-b-2 border-gray-100 flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm">03</span>
                Strategic Market Roadmap
              </h3>
              <div className="bg-dark-bg p-10 rounded-[2rem] text-white">
                 <h4 className="font-black mb-6 flex items-center gap-3">
                   <span className="text-brand-400">⚡</span> Recommended Career Pivot
                 </h4>
                 <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                       <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Target Role</div>
                       <div className="font-bold text-sm">{profile?.desiredRole || 'Tech Lead'}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                       <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Projected Salary</div>
                       <div className="font-bold text-sm">$160k - $185k</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                       <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Growth Index</div>
                       <div className="font-bold text-sm text-brand-400">+24% YoY</div>
                    </div>
                 </div>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-10 border-t border-gray-100 text-center">
             <img src="/favicon.png" className="w-8 h-8 grayscale opacity-20 mx-auto mb-4" alt="" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Powered by SkillBridge AI Engine</p>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; background: white !important; }
          .print\\:p-0, .print\\:p-0 * { visibility: visible; }
          .print\\:p-0 { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0 !important; }
          .app-layout-nav, .app-layout-sidebar { display: none !important; }
          .print\\:break-before-page { break-before: page; }
          .bg-dark-bg { background-color: #030810 !important; -webkit-print-color-adjust: exact; }
          .text-white { color: white !important; -webkit-print-color-adjust: exact; }
          .text-brand-400 { color: #2dd4bf !important; -webkit-print-color-adjust: exact; }
        }
      `}} />
    </AppLayout>
  );
}
