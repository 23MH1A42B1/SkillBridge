import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';
import { scrapeAndSaveJobs } from '../services/jobScraperService';
import { runSkillMatchForUser, getMyMatches } from '../services/matchService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Jobs() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [userSkills, setUserSkills] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filterScore, setFilterScore] = useState(50);
  const [freshDesiredRole, setFreshDesiredRole] = useState('');
  
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const loadMatches = async (userId, minScore) => {
    const list = await getMyMatches(userId, minScore, 50);
    setMatches(list);
  };

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        // Re-fetch latest profile from Firestore so desiredRole is never stale
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setFreshDesiredRole(docSnap.data().desiredRole || '');
        }
        const skillsData = await getUserSkills(user.uid);
        setUserSkills(skillsData);
        if (skillsData) {
          await loadMatches(user.uid, filterScore);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user, filterScore]);

  // Auto-trigger for empty states
  useEffect(() => {
    if (!loading && userSkills && matches.length === 0 && !actionLoading) {
      handleScrape().then(() => handleMatch());
    }
  }, [loading, userSkills, matches.length]);

  const handleScrape = async () => {
    // Use freshly-fetched Firestore role, then fall back to profile context, then a generic default
    const roleToSearch = freshDesiredRole || profile?.desiredRole || 'Software Engineer';
    if (!freshDesiredRole && !profile?.desiredRole) {
      setStatusMsg({ text: `No desired role found in profile — searching for "${roleToSearch}" as default. Update your profile for better results.`, type: 'info' });
    }
    setActionLoading(true);
    setStatusMsg({ text: `Scraping live jobs for "${roleToSearch}"... This may take a moment.`, type: 'info' });
    try {
      const res = await scrapeAndSaveJobs(roleToSearch, 15);
      setStatusMsg({ text: `Successfully scraped and saved ${res.saved.added} new jobs for "${roleToSearch}"!`, type: 'success' });
    } catch (e) {
      setStatusMsg({ text: 'Failed to scrape jobs. Using cached data.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMatch = async () => {
    if(!userSkills) return;
    setActionLoading(true);
    setStatusMsg({ text: 'Running AI skill matching algorithm against database...', type: 'info' });
    try {
      const res = await runSkillMatchForUser(user.uid, userSkills.skills, filterScore);
      setStatusMsg({ text: `Analyzed ${res.totalJobsAnalyzed} jobs. Found ${res.matchesSaved} new matches.`, type: 'success' });
      await loadMatches(user.uid, filterScore);
    } catch (e) {
      setStatusMsg({ text: e.message || 'Failed to run matching algorithm.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Live Job Matches</h1>
            <p className="text-gray-400 mt-2 font-medium">Discover curated roles tailored exactly to your skill profile.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleScrape} 
              disabled={actionLoading}
              className="btn-secondary flex items-center gap-2 rounded-full px-6"
            >
              🔄 Refresh Jobs DB
            </button>
            <button 
              onClick={handleMatch} 
              disabled={actionLoading || !userSkills}
              className="btn-primary flex items-center gap-2 shadow-neon-glow rounded-full px-8"
            >
              ⚡ Run AI Match
            </button>
          </div>
        </div>

        {statusMsg.text && (
          <div className={`p-5 mb-8 rounded-2xl text-sm border flex items-start gap-4 animate-fade-in shadow-xl ${
            statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            'bg-brand-500/10 text-brand-300 border-brand-500/20'
          }`}>
            {statusMsg.type === 'info' && <div className="w-5 h-5 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin shrink-0"></div>}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-dark-card p-6 rounded-2xl border border-white/5 mb-10 shadow-xl flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Min Match Score:</span>
            <select 
              className="bg-dark-bg border border-white/10 text-white rounded-xl py-2 px-4 focus:ring-brand-500 focus:border-brand-500 text-sm font-bold transition-all"
              value={filterScore}
              onChange={(e) => setFilterScore(Number(e.target.value))}
            >
              <option value={80}>80% & Above</option>
              <option value={70}>70% & Above</option>
              <option value={60}>60% & Above</option>
              <option value={50}>50% & Above</option>
              <option value={0}>Show All</option>
            </select>
          </div>
          <p className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">{matches.length} Matches Found</p>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={4} />
        ) : !userSkills ? (
          <div className="bg-dark-card rounded-3xl border border-white/5 p-16 text-center shadow-2xl">
            <div className="text-5xl mb-6 grayscale opacity-50">👤</div>
            <h2 className="text-2xl font-black text-white mb-3">Profile Missing</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg leading-relaxed">You need to upload a resume and generate a skill profile before you can match against jobs.</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-dark-card rounded-3xl border border-white/5 p-20 text-center shadow-2xl animate-pulse">
            <div className="text-5xl mb-6 grayscale opacity-50">🔍</div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">AI Discovery in Progress...</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              We're initializing your personalized job market. Stand by for real-time matches.
            </p>
            <div className="flex justify-center gap-4">
               <button onClick={handleScrape} className="btn-secondary rounded-full px-8 py-3">Manual Scrape</button>
               <button onClick={handleMatch} className="btn-primary rounded-full px-10 py-3 shadow-neon-glow">Force Match</button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
            {matches.map(match => (
              <JobCard key={match.id} job={match} />
            ))}
          </div>
        )}
    </AppLayout>
  );
}
