// src/components/SkillCard.jsx
// Phase 3 — Updated to display AI-extracted skills + ATS breakdown.

import { Link } from 'react-router-dom';

function PillGroup({ skills, color }) {
  if (!Array.isArray(skills) || skills.length === 0) return null;
  const colors = {
    blue:   'bg-blue-900/40 border-blue-700 text-blue-300',
    purple: 'bg-purple-900/40 border-purple-700 text-purple-300',
    green:  'bg-green-900/40 border-green-700 text-green-300',
    amber:  'bg-amber-900/40 border-amber-700 text-amber-300',
  };
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s, i) => (
        <span key={i} className={`rounded-full border px-3 py-1 text-xs ${colors[color] || colors.blue}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

function ScoreBar({ label, value }) {
  const color =
    value >= 80 ? 'bg-green-500' :
    value >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 flex-shrink-0 text-xs text-slate-400">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-medium text-slate-300">{value}</span>
    </div>
  );
}

export default function SkillCard({ profile }) {
  if (!profile) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
        <p className="text-4xl mb-4">🎯</p>
        <h2 className="text-xl font-semibold text-white">No skill profile yet</h2>
        <p className="mt-2 text-slate-300 text-sm">
          Upload your resume to generate your AI-powered skill profile and ATS score.
        </p>
        <Link
          to="/upload"
          className="mt-5 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  const gradeColor = {
    A: 'text-green-400', B: 'text-blue-400',
    C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400',
  }[profile.ATSGrade] || 'text-slate-300';

  const subScores = profile.ATSSubScores
    ? (typeof profile.ATSSubScores === 'string'
        ? JSON.parse(profile.ATSSubScores)
        : profile.ATSSubScores)
    : null;

  const improvements = Array.isArray(profile.Improvements)
    ? profile.Improvements
    : [];

  return (
    <div className="space-y-6">

      {/* Score cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-center">
          <p className="text-sm text-slate-400">Profile Score</p>
          <p className="mt-2 text-4xl font-bold text-blue-400">{profile.ProfileScore ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-center">
          <p className="text-sm text-slate-400">ATS Score</p>
          <p className={`mt-2 text-4xl font-bold ${gradeColor}`}>
            {profile.ATSScore ?? 0}
            {profile.ATSGrade && <span className="text-2xl ml-1">({profile.ATSGrade})</span>}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-center">
          <p className="text-sm text-slate-400">Skills Found</p>
          <p className="mt-2 text-4xl font-bold text-purple-400">
            {(profile.TechnicalSkills?.length || 0) + (profile.Tools?.length || 0)}
          </p>
        </div>
      </div>

      {/* ATS summary */}
      {profile.ATSSummary && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            ATS Verdict
          </p>
          <p className="text-sm text-slate-200">{profile.ATSSummary}</p>
        </div>
      )}

      {/* Summary */}
      {profile.ProfileSummary && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Professional Summary
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">{profile.ProfileSummary}</p>
        </div>
      )}

      {/* Skills */}
      {[
        { label: 'Technical Skills',    key: 'TechnicalSkills', color: 'blue'   },
        { label: 'Soft Skills',         key: 'SoftSkills',      color: 'purple' },
        { label: 'Tools & Platforms',   key: 'Tools',           color: 'green'  },
        { label: 'Certifications',      key: 'Certifications',  color: 'amber'  },
      ].map(({ label, key, color }) =>
        Array.isArray(profile[key]) && profile[key].length > 0 ? (
          <div key={key} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{label}</p>
            <PillGroup skills={profile[key]} color={color} />
          </div>
        ) : null
      )}

      {/* ATS sub-scores */}
      {subScores && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">ATS Breakdown</p>
          <div className="space-y-3">
            {Object.entries(subScores).map(([key, val]) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, s => s.toUpperCase());
              return <ScoreBar key={key} label={label} value={Number(val)} />;
            })}
          </div>
        </div>
      )}

      {/* Keywords */}
      {profile.KeywordsFound?.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Keywords Found ({profile.KeywordsFound.length})
          </p>
          <PillGroup skills={profile.KeywordsFound} color="green" />
        </div>
      )}

      {profile.KeywordsMissing?.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Keywords Missing — add these to your resume
          </p>
          <PillGroup skills={profile.KeywordsMissing} color="amber" />
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Improvement Recommendations
          </p>
          <div className="space-y-3">
            {improvements.map((imp, i) => (
              <div key={i} className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                <span className={`text-xs font-semibold mr-2
                  ${imp.priority === 'Critical' ? 'text-red-400' :
                    imp.priority === 'Important' ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {imp.priority}
                </span>
                <span className="text-sm text-slate-200">{imp.issue}</span>
                {imp.fix && <p className="text-xs text-slate-500 mt-1">→ {imp.fix}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last updated */}
      {profile.LastParsedDate && (
        <p className="text-xs text-slate-500 text-right">
          Last analyzed: {new Date(profile.LastParsedDate).toLocaleString()}
        </p>
      )}
    </div>
  );
}
