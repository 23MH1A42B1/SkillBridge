// src/pages/Jobs.jsx
// Phase 3 Part 2 — Full jobs page with:
//  - Live job scraper (calls Claude → saves to SharePoint LiveJobs)
//  - Skill matcher (compares user skills vs jobs → saves MatchResults)
//  - Displays matched jobs with score bars, skill pills, apply links

import { useEffect, useMemo, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAzureObjectId } from '../services/userService';
import { getLiveJobsByIds, getMyMatches, runSkillMatchForUser } from '../services/matchService';
import { scrapeAndSaveJobs } from '../services/jobScraperService';
import { getUserSkills } from '../services/resumeService';

// ── Source badge colours ──────────────────────────────────────
const SOURCE_COLORS = {
  LinkedIn:    'bg-blue-900/40 border-blue-700 text-blue-300',
  Naukri:      'bg-orange-900/40 border-orange-700 text-orange-300',
  Indeed:      'bg-indigo-900/40 border-indigo-700 text-indigo-300',
  'Google Jobs':'bg-green-900/40 border-green-700 text-green-300',
  Shine:       'bg-purple-900/40 border-purple-700 text-purple-300',
  Glassdoor:   'bg-teal-900/40 border-teal-700 text-teal-300',
  Internshala: 'bg-pink-900/40 border-pink-700 text-pink-300',
};

function ScoreBar({ score }) {
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 65 ? 'bg-yellow-500' : 'bg-orange-500';
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function JobCard({ entry }) {
  const { job, MatchScore, MatchedSkills = [], MissingSkills = [], Verdict } = entry;
  const [expanded, setExpanded] = useState(false);

  if (!job) return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-400">
      Job details unavailable for ID: {entry.JobID}
    </div>
  );

  const scoreColor =
    MatchScore >= 80 ? 'text-green-400' :
    MatchScore >= 65 ? 'text-yellow-400' : 'text-orange-400';

  const sourceCls = SOURCE_COLORS[job.Source] || 'bg-slate-700 border-slate-600 text-slate-300';

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
      <div className="p-5">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            {/* Company avatar */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {job.Company?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white leading-tight">{job.Title}</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {job.Company}
                {job.Location ? ` · ${job.Location}` : ''}
                {job.WorkMode ? ` · ${job.WorkMode}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-2xl font-bold ${scoreColor}`}>{MatchScore}%</span>
            <p className="text-xs text-slate-500 mt-0.5">{Verdict?.replace(/_/g,' ')}</p>
          </div>
        </div>

        {/* Match bar */}
        <ScoreBar score={MatchScore} />

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={`rounded-full border px-2 py-0.5 text-xs ${sourceCls}`}>
            {job.Source}
          </span>
          {job.JobType && (
            <span className="rounded-full border border-slate-600 bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300">
              {job.JobType}
            </span>
          )}
          {job.ExperienceRequired && (
            <span className="rounded-full border border-slate-600 bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300">
              {job.ExperienceRequired}
            </span>
          )}
          {job.Salary && (
            <span className="text-xs font-medium text-green-400 ml-auto">{job.Salary}</span>
          )}
        </div>

        {/* Matched skills */}
        {MatchedSkills.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-1.5">Matched skills</p>
            <div className="flex flex-wrap gap-1.5">
              {MatchedSkills.slice(0, 8).map((s, i) => (
                <span key={i} className="rounded-full border border-emerald-700 bg-emerald-900/40 px-2.5 py-0.5 text-xs text-emerald-300">
                  {s}
                </span>
              ))}
              {MatchedSkills.length > 8 && (
                <span className="text-xs text-slate-500">+{MatchedSkills.length - 8} more</span>
              )}
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition"
        >
          {expanded ? '▲ Show less' : '▼ Show more details'}
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-slate-700 bg-slate-900/50 p-5 space-y-4">
          {job.JobDescription && (
            <p className="text-sm text-slate-300 leading-relaxed">{job.JobDescription}</p>
          )}

          {MissingSkills.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Skills to learn</p>
              <div className="flex flex-wrap gap-1.5">
                {MissingSkills.map((s, i) => (
                  <span key={i} className="rounded-full border border-red-800 bg-red-900/30 px-2.5 py-0.5 text-xs text-red-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.ApplyURL && (
            <a
              href={job.ApplyURL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              Apply Now →
            </a>
          )}
        </div>
      )}
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function Jobs() {
  const { instance, accounts } = useMsal();
  const account  = instance.getActiveAccount() || accounts[0];
  const userId   = useMemo(() => getAzureObjectId(account), [account]);

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [jobs, setJobs]               = useState([]);
  const [minScore, setMinScore]       = useState(60);
  const [sourceFilter, setSourceFilter] = useState('All');

  // Scraper state
  const [scraping, setScraping]       = useState(false);
  const [scrapeMsg, setScrapeMsg]     = useState('');
  const [scrapeStep, setScrapeStep]   = useState('');

  // Match state
  const [matching, setMatching]       = useState(false);
  const [matchMsg, setMatchMsg]       = useState('');

  // Load existing matches on mount
  useEffect(() => {
    if (!userId) return;
    loadMatches();
  }, [userId, minScore]);

  async function loadMatches() {
    setLoading(true);
    setError('');
    try {
      const matches     = await getMyMatches(userId, minScore, 50);
      const jobDetails  = await getLiveJobsByIds(matches.map(m => m.JobID));
      const byId        = new Map(jobDetails.map(j => [j.JobID, j]));
      const merged      = matches.map(m => ({ ...m, job: byId.get(m.JobID) || null }));
      setJobs(merged);
    } catch (err) {
      setError(err.message || 'Failed to load matches.');
    } finally {
      setLoading(false);
    }
  }

  // Scrape new jobs
  async function handleScrape() {
    setScraping(true);
    setScrapeMsg('');
    try {
      setScrapeStep('Generating live jobs with AI...');
      // Get user's desired role for better job generation
      let role = '';
      try {
        const skills = await getUserSkills(userId);
        role = skills?.DesiredRole || '';
      } catch { /* skip */ }

      setScrapeStep(`Finding jobs for: ${role || 'Software Developer'}...`);
      const result = await scrapeAndSaveJobs(role, 10);

      setScrapeMsg(`✓ ${result.added} new jobs added, ${result.skipped} already existed`);
      setScrapeStep('');
    } catch (err) {
      setScrapeMsg(`✗ Scrape failed: ${err.message}`);
      setScrapeStep('');
    } finally {
      setScraping(false);
    }
  }

  // Run skill matching
  async function handleMatch() {
    setMatching(true);
    setMatchMsg('');
    try {
      const skills = await getUserSkills(userId);
      if (!skills) {
        setMatchMsg('✗ No skill profile found. Upload your resume first.');
        setMatching(false);
        return;
      }

      const result = await runSkillMatchForUser(userId, skills, minScore);
      setMatchMsg(`✓ ${result.matchesSaved} matches saved from ${result.totalJobs} jobs`);

      // Reload matches to show new results
      await loadMatches();
    } catch (err) {
      setMatchMsg(`✗ Matching failed: ${err.message}`);
    } finally {
      setMatching(false);
    }
  }

  // Filter by source
  const sources  = ['All', 'LinkedIn', 'Naukri', 'Indeed', 'Google Jobs', 'Shine', 'Glassdoor'];
  const filtered = sourceFilter === 'All'
    ? jobs
    : jobs.filter(e => e.job?.Source === sourceFilter);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Matched Jobs</h1>
          <p className="mt-1 text-slate-300">
            {jobs.length > 0
              ? `${filtered.length} jobs matched your skill profile`
              : 'Scrape live jobs then run matching to see your results'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Scrape button */}
          <button
            onClick={handleScrape}
            disabled={scraping || matching}
            className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {scraping ? (
              <><span className="animate-spin">⟳</span> Scraping...</>
            ) : (
              <><span>🌐</span> Scrape Live Jobs</>
            )}
          </button>
          {/* Match button */}
          <button
            onClick={handleMatch}
            disabled={matching || scraping}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {matching ? (
              <><span className="animate-spin">⟳</span> Matching...</>
            ) : (
              <><span>⚡</span> Run Skill Match</>
            )}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {scrapeStep && (
        <div className="rounded-lg border border-blue-700 bg-blue-900/20 px-4 py-3 text-sm text-blue-300">
          <span className="animate-pulse">⟳</span> {scrapeStep}
        </div>
      )}
      {scrapeMsg && (
        <div className={`rounded-lg border px-4 py-3 text-sm
          ${scrapeMsg.startsWith('✓')
            ? 'border-green-700 bg-green-900/20 text-green-300'
            : 'border-red-700 bg-red-900/20 text-red-300'}`}>
          {scrapeMsg}
        </div>
      )}
      {matchMsg && (
        <div className={`rounded-lg border px-4 py-3 text-sm
          ${matchMsg.startsWith('✓')
            ? 'border-green-700 bg-green-900/20 text-green-300'
            : 'border-red-700 bg-red-900/20 text-red-300'}`}>
          {matchMsg}
        </div>
      )}

      {/* Filters */}
      {jobs.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Min score filter */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Min match:</span>
            {[50, 60, 70, 80].map(v => (
              <button
                key={v}
                onClick={() => setMinScore(v)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition
                  ${minScore === v
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-600 text-slate-400 hover:text-white'}`}
              >
                {v}%+
              </button>
            ))}
          </div>

          {/* Source filter */}
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {sources.map(s => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition
                  ${sourceFilter === s
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-700" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-700 bg-red-900/30 p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-10 text-center">
          <p className="text-4xl mb-4">💼</p>
          <h2 className="text-xl font-semibold text-white mb-2">No job matches yet</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            First click <strong className="text-white">Scrape Live Jobs</strong> to pull fresh jobs,
            then click <strong className="text-white">Run Skill Match</strong> to match them against your skills.
          </p>
          <p className="text-slate-500 text-xs">
            Make sure you have uploaded your resume first so your skill profile exists.
          </p>
        </div>
      )}

      {/* Job cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <JobCard key={entry.itemId || entry.JobID} entry={entry} />
          ))}
        </div>
      )}

      {/* No results after filter */}
      {!loading && !error && jobs.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-center text-slate-400 text-sm">
          No jobs match the current filter. Try lowering the minimum match score.
        </div>
      )}

    </div>
  );
}
