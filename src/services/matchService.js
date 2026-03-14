// src/services/matchService.js
// Phase 3 Part 2 — Skill matching engine.
//
// Flow:
//  1. getMyMatches()          — fetch existing matches from SharePoint MatchResults
//  2. getLiveJobsByIds()      — fetch job details from SharePoint LiveJobs
//  3. runSkillMatchForUser()  — compare user skills vs jobs, save new matches
//  4. matchAndSave()          — full pipeline: fetch skills → get jobs → match → save

import graphClient from './graphClient';
import { getSiteId, getListIdByName } from './userService';

// ── helpers ──────────────────────────────────────────────────

function tryParse(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return []; }
}

function escapeOData(value) {
  return String(value).replace(/'/g, "''");
}

// ── Fetch existing match results for a user ──────────────────

export async function getMyMatches(userId, minScore = 0, limit = 50) {
  const siteId       = await getSiteId();
  const matchListId  = await getListIdByName('MatchResults');
  const safeId       = escapeOData(userId);

  const result = await graphClient
    .api(`/sites/${siteId}/lists/${matchListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${safeId}'${minScore > 0 ? ` and fields/MatchScore ge ${minScore}` : ''}`)
    .top(limit)
    .get();

  return result.value
    .map(item => ({
      itemId:        item.id,
      ...item.fields,
      MatchScore:    Number(item.fields.MatchScore || 0),
      MatchedSkills: tryParse(item.fields.MatchedSkills),
      MissingSkills: tryParse(item.fields.MissingSkills),
      BonusSkills:   tryParse(item.fields.BonusSkills),
    }))
    .sort((a, b) => b.MatchScore - a.MatchScore);
}

// ── Fetch job details by JobIDs ───────────────────────────────

export async function getLiveJobsByIds(jobIds) {
  if (!jobIds || !jobIds.length) return [];

  const siteId     = await getSiteId();
  const jobsListId = await getListIdByName('LiveJobs');
  const unique     = [...new Set(jobIds.filter(Boolean))];

  const jobs = await Promise.all(
    unique.map(async (jobId) => {
      try {
        const result = await graphClient
          .api(`/sites/${siteId}/lists/${jobsListId}/items`)
          .expand('fields')
          .filter(`fields/JobID eq '${escapeOData(jobId)}'`)
          .top(1)
          .get();

        if (!result.value.length) return null;
        const item = result.value[0];
        return {
          itemId:          item.id,
          ...item.fields,
          RequiredSkills:  tryParse(item.fields.RequiredSkills),
          PreferredSkills: tryParse(item.fields.PreferredSkills),
        };
      } catch {
        return null;
      }
    })
  );

  return jobs.filter(Boolean);
}

// ── Core skill match score calculator ───────────────────────

export function calculateMatchScore(userSkills, requiredSkills, preferredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) return 0;

  const userSet = new Set(userSkills.map(s => s.toLowerCase()));

  // Required = 70% weight
  const reqMatches  = requiredSkills.filter(s => userSet.has(s.toLowerCase()));
  const reqScore    = (reqMatches.length / requiredSkills.length) * 70;

  // Preferred = 30% weight
  let prefScore = 0;
  if (preferredSkills.length > 0) {
    const prefMatches = preferredSkills.filter(s => userSet.has(s.toLowerCase()));
    prefScore = (prefMatches.length / preferredSkills.length) * 30;
  } else {
    prefScore = reqScore > 0 ? 15 : 0;
  }

  return Math.round(reqScore + prefScore);
}

export function analyzeSkillGap(userSkills, requiredSkills, preferredSkills = []) {
  const userSet = new Set(userSkills.map(s => s.toLowerCase()));

  const matched  = requiredSkills.filter(s => userSet.has(s.toLowerCase()));
  const missing  = requiredSkills.filter(s => !userSet.has(s.toLowerCase()));
  const bonus    = preferredSkills.filter(s => userSet.has(s.toLowerCase()));

  return { matched, missing, bonus };
}

// ── Save a match result to SharePoint ─────────────────────────

export async function saveMatchResult(userId, jobId, score, matched, missing, bonus) {
  const siteId      = await getSiteId();
  const matchListId = await getListIdByName('MatchResults');

  // Check if match already exists
  const existing = await graphClient
    .api(`/sites/${siteId}/lists/${matchListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${escapeOData(userId)}' and fields/JobID eq '${escapeOData(jobId)}'`)
    .top(1)
    .get();

  const verdict =
    score >= 85 ? 'STRONG MATCH' :
    score >= 70 ? 'GOOD MATCH'   :
    score >= 55 ? 'PARTIAL MATCH': 'WEAK MATCH';

  const fields = {
    UserID:        userId,
    JobID:         jobId,
    MatchScore:    score,
    Verdict:       verdict,
    MatchedSkills: JSON.stringify(matched),
    MissingSkills: JSON.stringify(missing),
    BonusSkills:   JSON.stringify(bonus),
    EmailSent:     false,
    MatchedAt:     new Date().toISOString(),
  };

  if (existing.value.length > 0) {
    const itemId = existing.value[0].id;
    await graphClient
      .api(`/sites/${siteId}/lists/${matchListId}/items/${itemId}/fields`)
      .patch(fields);
    return { itemId, ...fields, updated: true };
  }

  const created = await graphClient
    .api(`/sites/${siteId}/lists/${matchListId}/items`)
    .post({ fields });
  return { itemId: created.id, ...fields, updated: false };
}

// ── Run full match pipeline for one user ─────────────────────

export async function runSkillMatchForUser(userId, userSkills, minScore = 55) {
  // 1. Fetch all active jobs from LiveJobs
  const siteId     = await getSiteId();
  const jobsListId = await getListIdByName('LiveJobs');

  const jobsResult = await graphClient
    .api(`/sites/${siteId}/lists/${jobsListId}/items`)
    .expand('fields')
    .filter('fields/IsActive eq 1')
    .top(100)
    .get();

  const allJobs = jobsResult.value.map(item => ({
    itemId:          item.id,
    ...item.fields,
    RequiredSkills:  tryParse(item.fields.RequiredSkills),
    PreferredSkills: tryParse(item.fields.PreferredSkills),
  }));

  // 2. Compute all skill arrays for this user
  const allUserSkills = [
    ...tryParse(userSkills.TechnicalSkills),
    ...tryParse(userSkills.SoftSkills),
    ...tryParse(userSkills.Tools),
    ...tryParse(userSkills.Certifications),
  ];

  // 3. Match and save
  const results   = [];
  let   saved     = 0;
  let   skipped   = 0;

  for (const job of allJobs) {
    const score = calculateMatchScore(
      allUserSkills,
      job.RequiredSkills,
      job.PreferredSkills
    );

    if (score < minScore) { skipped++; continue; }

    const { matched, missing, bonus } = analyzeSkillGap(
      allUserSkills,
      job.RequiredSkills,
      job.PreferredSkills
    );

    try {
      const result = await saveMatchResult(
        userId, job.JobID, score, matched, missing, bonus
      );
      results.push(result);
      saved++;
    } catch (err) {
      console.error(`[MatchService] Failed to save match ${job.JobID}:`, err.message);
    }
  }

  return {
    totalJobs:      allJobs.length,
    matchesSaved:   saved,
    belowThreshold: skipped,
    topMatches:     results
      .sort((a, b) => b.MatchScore - a.MatchScore)
      .slice(0, 10),
  };
}
