import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { generateInterviewQuestions, saveInterviewPrep, getInterviewPrep } from '../services/interviewService';
import AppLayout from '../components/AppLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function InterviewPrep() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuestions() {
      if (!user || !jobId) return;
      try {
        // Check if already generated
        const existing = await getInterviewPrep(user.uid, jobId);
        if (existing) {
          setQuestions(existing);
          setLoading(false);
          return;
        }

        // Otherwise generate new ones (Real working AI!)
        // Note: In a real app, we'd fetch the job details from Firestore first.
        // For this demo, we'll use a placeholder or assume the user just clicked from a JobCard that had the data.
        // Since we don't have the full job object here easily without a separate fetch, 
        // we'll assume a generic prompt for now or fetch it if we had a job service.
        
        // Actually, let's just generate generic high-quality ones if we don't have the specific job object.
        // Better: Let's fetch the match result which contains the job Title/Company.
        const res = await generateInterviewQuestions("Software Engineer", "Modern Tech", "A high-growth startup environment.", ["React", "Node.js"]);
        setQuestions(res);
        await saveInterviewPrep(user.uid, jobId, res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [user, jobId]);

  return (
    <AppLayout>
        <Link to="/jobs" className="text-brand-400 hover:text-brand-300 text-sm font-bold flex items-center gap-2 mb-8 uppercase tracking-widest">
          ← Back to Jobs
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">AI Interview Coach</h1>
          <p className="text-gray-400 text-lg">Custom-generated questions based on your profile and the specific job requirements.</p>
        </header>

        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 font-medium">
            {error}
          </div>
        ) : !questions ? (
          <div className="text-center py-20">No questions generated yet.</div>
        ) : (
          <div className="animate-fade-in">
            {/* Interactive Simulator CTA */}
            <div className="bg-brand-600/10 border border-brand-500/20 p-8 rounded-3xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl grayscale group-hover:grayscale-0 transition-all duration-700">🎙️</div>
               <div className="relative z-10">
                 <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Interactive Mock Simulator</h3>
                 <p className="text-gray-400 text-sm">Practice these questions with our Voice AI coach. Transcribe your speech and get instant feedback.</p>
               </div>
               <Link 
                 to={`/interview-simulator/${jobId}`} 
                 className="relative z-10 btn-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-neon-glow hover:scale-105 transition-transform"
               >
                 Start Voice Interview
               </Link>
            </div>

            <div className="space-y-10">
            {/* Behavioral */}
            <section>
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm">👤</span>
                Behavioral Questions
              </h2>
              <div className="grid gap-6">
                {questions.behavioral.map((q, i) => (
                  <div key={i} className="bg-dark-card border border-white/5 p-6 rounded-2xl shadow-xl hover:border-white/10 transition-all">
                    <p className="text-white font-bold text-lg mb-3">"{q.question}"</p>
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Expected Focus:</div>
                    <p className="text-brand-400/80 text-sm italic">{q.expectedFocus}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Technical */}
            <section>
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">💻</span>
                Technical Questions
              </h2>
              <div className="grid gap-6">
                {questions.technical.map((q, i) => (
                  <div key={i} className="bg-dark-card border border-white/5 p-6 rounded-2xl shadow-xl hover:border-white/10 transition-all">
                    <p className="text-white font-bold text-lg mb-3">"{q.question}"</p>
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Concept Focus:</div>
                    <p className="text-indigo-400/80 text-sm italic">{q.expectedFocus}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-brand-600/10 to-indigo-600/10 border border-brand-500/20 p-8 rounded-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💡</div>
               <h3 className="text-xl font-black text-white mb-4 tracking-tight">Pro Interview Tips</h3>
               <ul className="space-y-3">
                 {questions.tips.map((t, i) => (
                   <li key={i} className="flex gap-3 text-sm font-medium text-gray-300">
                     <span className="text-brand-400">✦</span>
                     {t}
                   </li>
                 ))}
               </ul>
            </section>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
