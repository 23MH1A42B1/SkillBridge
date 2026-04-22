import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function LinkedInOptimizer() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [userSkills, setUserSkills] = useState(null);
  const [results, setResults] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const skills = await getUserSkills(user.uid);
        setUserSkills(skills);
        if (skills) handleOptimize(skills);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleOptimize = async (skills = userSkills) => {
    if (!skills) return;
    setOptimizing(true);
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
              content: "You are an Elite LinkedIn Personal Branding Expert. Generate a high-impact LinkedIn Headline, an About section, and a Skill Pinning strategy based on the provided skills. Output in JSON format with keys: headline, about, pinningStrategy, and bannerPrompt." 
            },
            { 
              role: "user", 
              content: `Name: ${profile?.fullName || 'Professional'}. Role: ${profile?.desiredRole || 'Tech Professional'}. Skills: ${skills.skills?.technical?.join(', ')}` 
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      let content = data.choices[0].message.content;
      
      // Sanitize: AI sometimes wraps JSON in markdown blocks
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0];
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0];
      }

      try {
        const parsed = JSON.parse(content.trim());
        setResults(parsed);
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, content);
        showToast("AI returned an invalid format. Retrying...", "warning");
        // Fallback or retry logic could go here
      }
    } catch (err) {
      console.error("Optimization error:", err);
      showToast("Optimization failed. Please check your connection.", "error");
    } finally {
      setOptimizing(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, "success");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
           <div>
              <p className="text-brand-400 text-xs font-black uppercase tracking-widest mb-2">Personal Branding</p>
              <h1 className="text-4xl font-black text-white tracking-tight">LinkedIn Optimizer</h1>
              <p className="text-gray-500 mt-2 font-medium">Turn your profile into a recruiter magnet.</p>
           </div>
           <button 
             onClick={() => handleOptimize()}
             disabled={optimizing || !userSkills}
             className="btn-primary py-3 px-8 rounded-full shadow-neon-glow flex items-center gap-2"
           >
             {optimizing ? 'Generating...' : '✨ Re-Optimize'}
           </button>
        </header>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : !userSkills ? (
          <div className="bg-dark-card rounded-3xl border border-white/5 p-20 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-3">Upload Resume First</h2>
            <p className="text-gray-400 mb-8">We need your skill data to optimize your brand.</p>
            <Link to="/upload" className="btn-primary rounded-full px-10 py-4 shadow-neon-glow">Upload Now</Link>
          </div>
        ) : (
          <div className="space-y-10 animate-fade-in">
            {results && (
              <>
                {/* ── Headline ─────────────────────────────────────── */}
                <div className="bg-dark-card border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl">🖋️</div>
                  <h3 className="text-xs font-black text-brand-400 uppercase tracking-widest mb-6">Power Headline</h3>
                  <div className="flex justify-between items-start gap-6">
                     <p className="text-2xl font-black text-white leading-tight">{results?.headline || 'Generating your headline...'}</p>
                     <button onClick={() => copyToClipboard(results?.headline, 'Headline')} className="shrink-0 p-3 bg-white/5 rounded-2xl hover:bg-brand-600 transition-all">📋</button>
                  </div>
                </div>

                {/* ── About Section ────────────────────────────────── */}
                <div className="bg-dark-card border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                  <h3 className="text-xs font-black text-brand-400 uppercase tracking-widest mb-6">Optimized "About" Section</h3>
                  <div className="relative">
                     <pre className="text-gray-300 whitespace-pre-wrap font-medium leading-relaxed text-sm bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                        {results?.about || 'Strategizing your professional story...'}
                     </pre>
                     <button 
                       onClick={() => copyToClipboard(results?.about, 'About section')}
                       className="absolute top-4 right-4 p-3 bg-dark-card border border-white/10 rounded-xl hover:bg-brand-600 transition-all shadow-xl"
                     >
                       📋 Copy All
                     </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   {/* ── Skill Pinning ─────────────────────────────── */}
                   <div className="bg-dark-card border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                      <h3 className="text-xs font-black text-brand-400 uppercase tracking-widest mb-6">Skill Pinning Strategy</h3>
                      <div className="space-y-4">
                         {(results?.pinningStrategy || '').split(',').map((s, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                               <span className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-[10px] font-black">{i+1}</span>
                               <span className="text-sm font-bold text-gray-200">{s.trim()}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* ── Banner Prompt ─────────────────────────────── */}
                   <div className="bg-gradient-to-br from-brand-600/20 to-indigo-600/20 border border-brand-500/20 rounded-[2.5rem] p-10 shadow-2xl">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">AI Banner Prompt</h3>
                      <p className="text-gray-400 text-xs leading-relaxed mb-8">Copy this into an AI image generator (like Midjourney or DALL-E) to create a premium LinkedIn background.</p>
                      <div className="p-6 bg-dark-card/50 rounded-2xl border border-white/10 italic text-[13px] text-brand-300 mb-6">
                        "{results?.bannerPrompt || 'Visualizing your brand...'}"
                      </div>
                      <button 
                        onClick={() => copyToClipboard(results?.bannerPrompt, 'Banner prompt')}
                        className="w-full py-4 bg-brand-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-neon-glow"
                      >
                        Copy Prompt
                      </button>
                   </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
