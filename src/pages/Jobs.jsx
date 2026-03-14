import { useEffect, useMemo, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getLiveJobsByIds, getMyMatches } from '../services/matchService';
import { getAzureObjectId } from '../services/userService';

export default function Jobs() {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() || accounts[0];
  const userId = useMemo(() => getAzureObjectId(account), [account]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const matches = await getMyMatches(userId, 60, 50);
        const relatedJobs = await getLiveJobsByIds(matches.map((match) => match.JobID));
        const jobsById = new Map(relatedJobs.map((job) => [job.JobID, job]));

        const merged = matches.map((match) => ({
          ...match,
          job: jobsById.get(match.JobID) || null,
        }));

        if (active) {
          setJobs(merged);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load job matches.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Matched Jobs</h1>
        <p className="mt-1 text-slate-300">Your personalised matches from MatchResults and LiveJobs.</p>
      </div>

      {loading && <div className="h-80 animate-pulse rounded-xl bg-slate-700" />}

      {!loading && error && (
        <div className="rounded-xl border border-red-700 bg-red-900/30 p-4 text-red-200">{error}</div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-300">
          No matched jobs found yet.
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((entry) => (
            <article key={entry.itemId} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{entry.job?.Title || entry.JobID}</h2>
                  <p className="text-sm text-slate-300">
                    {entry.job?.Company || 'Company unavailable'}
                    {entry.job?.Source ? ` · ${entry.job.Source}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                  {entry.MatchScore}% Match
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {entry.MatchedSkills.map((skill) => (
                  <span
                    key={`${entry.itemId}-${skill}`}
                    className="rounded-full border border-emerald-700 bg-emerald-900/40 px-3 py-1 text-xs text-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {entry.job?.Salary && <span className="text-sm text-slate-300">Salary: {entry.job.Salary}</span>}
                {entry.job?.ApplyURL && (
                  <a
                    href={entry.job.ApplyURL}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    Apply
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
