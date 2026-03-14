import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { getMyMatches } from '../services/matchService';
import { getUserSkills } from '../services/resumeService';
import { getAzureObjectId, getUserByUserId } from '../services/userService';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-slate-700" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-xl bg-slate-700" />
        <div className="h-28 animate-pulse rounded-xl bg-slate-700" />
        <div className="h-28 animate-pulse rounded-xl bg-slate-700" />
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-slate-700" />
    </div>
  );
}

export default function Dashboard() {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() || accounts[0];
  const userId = useMemo(() => getAzureObjectId(account), [account]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRecord, setUserRecord] = useState(null);
  const [skillProfile, setSkillProfile] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [user, skills, topMatches] = await Promise.all([
          getUserByUserId(userId),
          getUserSkills(userId),
          getMyMatches(userId, 0, 5),
        ]);

        if (!active) {
          return;
        }

        setUserRecord(user);
        setSkillProfile(skills);
        setMatches(topMatches.slice(0, 5));
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-700 bg-red-900/30 p-4 text-red-200">
        {error}
      </div>
    );
  }

  const noResume = !skillProfile?.ResumeURL;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-300">Welcome back, {userRecord?.FullName || account?.name || 'Candidate'}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-600">
          <p className="text-sm text-slate-300">Profile Score</p>
          <p className="mt-2 text-3xl font-semibold text-blue-400">{skillProfile?.ProfileScore ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-600">
          <p className="text-sm text-slate-300">ATS Score</p>
          <p className="mt-2 text-3xl font-semibold text-blue-400">{skillProfile?.ATSScore ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-600">
          <p className="text-sm text-slate-300">Top Matches</p>
          <p className="mt-2 text-3xl font-semibold text-blue-400">{matches.length}</p>
        </div>
      </div>

      {noResume ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center shadow-lg shadow-black/20">
          <h2 className="text-xl font-semibold text-white">No resume uploaded yet</h2>
          <p className="mt-2 text-slate-300">
            Upload your resume to unlock AI skill analysis and job matching.
          </p>
          <Link
            to="/upload"
            className="mt-5 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Go to Upload
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">Top 5 Matches</h2>
          {matches.length === 0 ? (
            <p className="mt-3 text-slate-300">No matches available yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {matches.map((match) => (
                <li
                  key={match.itemId}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-700/40 p-4 transition-all duration-200 hover:bg-slate-700/70"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{match.JobID}</p>
                    <p className="text-xs text-slate-300">Matched at: {match.MatchedAt || 'N/A'}</p>
                  </div>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                    {match.MatchScore}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
