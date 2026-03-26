import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';
import { scrapeAndSaveJobs } from '../services/jobScraperService';
import { runSkillMatchForUser, getMyMatches } from '../services/matchService';

export default function Jobs() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [userSkills, setUserSkills] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filterScore, setFilterScore] = useState(50);
  
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const loadMatches = async (userId, minScore) => {
    const list = await getMyMatches(userId, minScore, 50);
    setMatches(list);
  };

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
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

  const handleScrape = async () => {
    if(!profile?.desiredRole) {
       setStatusMsg({ text: 'Please define a desired role in your profile/upload first.', type: 'error' });
       return;
    }
    setActionLoading(true);
    setStatusMsg({ text: 'Scraping live jobs from the web... This may take a moment.', type: 'info' });
    try {
      const res = await scrapeAndSaveJobs(profile.desiredRole, 15);
      setStatusMsg({ text: `Successfully scraped and saved ${res.saved.added} new jobs!`, type: 'success' });
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
      setStatusMsg({ text: 'Failed to run matching algorithm.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Live Job Matches</h1>
            <p className="text-gray-500 mt-2">Discover curated roles tailored exactly to your skill profile.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleScrape} 
              disabled={actionLoading}
              className="btn-secondary flex items-center gap-2"
            >
              🔄 Refresh Jobs DB
            </button>
            <button 
              onClick={handleMatch} 
              disabled={actionLoading || !userSkills}
              className="btn-primary flex items-center gap-2 shadow-md"
            >
              ⚡ Run AI Match
            </button>
          </div>
        </div>

        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm border flex items-start gap-3 animate-fade-in ${
            statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
            statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
            'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {statusMsg.type === 'info' && <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin shrink-0"></div>}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-8 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Minimum Match Score:</span>
            <select 
              className="input-field py-1.5 px-3 w-auto min-w-[100px]"
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
          <p className="text-sm text-gray-500">Showing {matches.length} matches</p>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={4} />
        ) : !userSkills ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Missing</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">You need to upload a resume and generate a skill profile before you can match against jobs.</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No matches found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any jobs matching your profile above {filterScore}%. 
              Try lowering the threshold or refreshing the database.
            </p>
            <button onClick={handleMatch} className="btn-primary">Run Match Algorithm</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
            {matches.map(match => (
              <JobCard key={match.id} job={match} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
