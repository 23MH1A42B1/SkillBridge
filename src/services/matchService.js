import graphClient from './graphClient';
import { getListIdByName, getSiteId } from './userService';

function escapeODataValue(value) {
  return String(value).replace(/'/g, "''");
}

function normalizeMultiValue(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value
      .split(/[;,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

export async function getMyMatches(userId, minScore = 0, limit = 50) {
  const siteId = await getSiteId();
  const matchesListId = await getListIdByName('MatchResults');
  const safeUserId = escapeODataValue(userId);

  const result = await graphClient
    .api(`/sites/${siteId}/lists/${matchesListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${safeUserId}' and fields/MatchScore ge ${Number(minScore)}`)
    .top(limit)
    .get();

  return result.value
    .map((item) => ({
      itemId: item.id,
      ...item.fields,
      MatchScore: Number(item.fields.MatchScore || 0),
      MatchedSkills: normalizeMultiValue(item.fields.MatchedSkills),
      MissingSkills: normalizeMultiValue(item.fields.MissingSkills),
    }))
    .sort((a, b) => b.MatchScore - a.MatchScore);
}

export async function getLiveJobsByIds(jobIds) {
  if (!jobIds.length) {
    return [];
  }

  const siteId = await getSiteId();
  const jobsListId = await getListIdByName('LiveJobs');
  const uniqueIds = [...new Set(jobIds.filter(Boolean))];

  const jobs = await Promise.all(
    uniqueIds.map(async (jobId) => {
      const safeJobId = escapeODataValue(jobId);
      const result = await graphClient
        .api(`/sites/${siteId}/lists/${jobsListId}/items`)
        .expand('fields')
        .filter(`fields/JobID eq '${safeJobId}'`)
        .top(1)
        .get();

      if (!result.value.length) {
        return null;
      }

      const item = result.value[0];
      return {
        itemId: item.id,
        ...item.fields,
        RequiredSkills: normalizeMultiValue(item.fields.RequiredSkills),
      };
    }),
  );

  return jobs.filter(Boolean);
}
