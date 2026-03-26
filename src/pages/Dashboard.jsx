import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getUserSkills } from '../services/resumeService';
import { getMyMatches } from '../services/matchService';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState(null);
  const [topMatches, setTopMatches] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const skillsData = await getUserSkills(user.uid);
        setUserSkills(skillsData);
        if (skillsData) {
          const matches = await getMyMatches(user.uid, 60, 5);
          setTopMatches(matches);
        }
      } catch (err) {
        console.error("Dashboard load err", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {profile?.fullName?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-gray-500 mt-2">Here's your career progress overview today.</p>
          </div>
          {userSkills && (
            <Link to="/upload" className="btn-secondary">Update Resume</Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            <LoadingSkeleton type="stat" count={4} />
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : !userSkills ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📄</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Resume Found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Upload your resume so our AI can extract your skills, estimate your ATS score, and match you with jobs.
            </p>
            <Link to="/upload" className="btn-primary text-lg px-8 py-3">Upload Resume</Link>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-brand-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                 <h3 className="text-sm font-semibold text-gray-500 mb-2 relative z-10">Overall Profile Score</h3>
                 <p className="text-3xl font-bold text-gray-900 relative z-10">{userSkills.profileScore}<span className="text-lg text-gray-400">/100</span></p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                 <h3 className="text-sm font-semibold text-gray-500 mb-2 relative z-10">ATS Score</h3>
                 <p className="text-3xl font-bold text-gray-900 relative z-10">{userSkills.atsScore?.total || 0}<span className="text-lg text-gray-400">/100</span></p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                 <h3 className="text-sm font-semibold text-gray-500 mb-2 relative z-10">Jobs Matched</h3>
                 <p className="text-3xl font-bold text-gray-900 relative z-10">{topMatches.length}</p>
                 {topMatches.length > 0 && <span className="text-xs text-green-600 font-medium absolute bottom-6 right-6 z-10">Action Req</span>}
               </div>
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                 <h3 className="text-sm font-semibold text-gray-500 mb-2 relative z-10">Total Skills Detected</h3>
                 <p className="text-3xl font-bold text-gray-900 relative z-10">
                   {(userSkills.skills?.technical?.length || 0) + (userSkills.skills?.tools?.length || 0) + (userSkills.skills?.soft?.length || 0)}
                 </p>
               </div>
            </div>

            {/* Top Matches Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Top Job Matches</h2>
                {topMatches.length > 0 && (
                  <Link to="/jobs" className="text-brand-600 hover:text-brand-700 font-medium text-sm">View All →</Link>
                )}
              </div>
              
              {topMatches.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm">
                  <p className="text-gray-500 mb-4">You have a resume, but haven't run any job matches yet.</p>
                  <Link to="/jobs" className="btn-primary">Find Jobs Now</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {topMatches.map(match => (
                    <JobCard key={match.id} job={match} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
