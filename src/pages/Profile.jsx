import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../auth/AuthContext';
import { getUserSkills } from '../services/resumeService';

export default function Profile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const skillsData = await getUserSkills(user.uid);
        setUserSkills(skillsData);
      } catch (err) {
        console.error("Profile load err", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Skill Profile</h1>
            <p className="text-gray-500 mt-2">Detailed breakdown of your ATS readiness and technical capabilities.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/upload" className="btn-secondary">Re-Upload Resume</Link>
            <Link to="/jobs" className="btn-primary">Find Jobs</Link>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={1} />
        ) : !userSkills ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Profile Data</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't uploaded a resume yet to generate your skill profile.
            </p>
            <Link to="/upload" className="btn-primary">Upload Resume Now</Link>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* User Meta Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-3xl font-bold text-brand-700">
                {profile?.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{profile?.fullName || user.email}</h2>
                <p className="text-brand-600 font-medium text-lg">{profile?.desiredRole || 'Job Seeker'}</p>
                <div className="mt-2 text-sm text-gray-500 flex flex-wrap justify-center md:justify-start gap-4">
                  <span className="flex items-center gap-1">🏫 {profile?.college || 'University not specified'}</span>
                  <span className="flex items-center gap-1">✉️ {user.email}</span>
                </div>
              </div>
              {userSkills.resumeUrl && (
                <div className="shrink-0 mt-4 md:mt-0">
                  <a href={userSkills.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    View Original Resume
                  </a>
                </div>
              )}
            </div>

            <SkillCard analysis={userSkills} />
            
            <div className="bg-brand-900 text-white rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl mix-blend-screen opacity-50 -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to test these skills?</h3>
                  <p className="text-brand-200 max-w-xl">
                    Your profile is locked and loaded. Run a match against real-time job listings to see where your exact skills are needed right now.
                  </p>
                </div>
                <Link to="/jobs" className="btn-primary bg-white text-brand-900 hover:bg-gray-100 whitespace-nowrap text-lg px-8 py-3 shrink-0">
                  Run Live Match
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
