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

export async function uploadResume(userId, file) {
  if (!userId) {
    throw new Error('UserID is required to upload a resume.');
  }
  if (!file) {
    throw new Error('No file provided for resume upload.');
  }

  const siteId = await getSiteId();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  const uploaded = await graphClient
    .api(`/sites/${siteId}/drive/root:/Resumes/${encodeURIComponent(userId)}/${encodeURIComponent(safeFileName)}:/content`)
    .put(file);

  return {
    id: uploaded.id,
    name: uploaded.name,
    webUrl: uploaded.webUrl,
    size: uploaded.size,
  };
}

export async function getUserSkills(userId) {
  const siteId = await getSiteId();
  const userSkillsListId = await getListIdByName('UserSkills');
  const safeUserId = escapeODataValue(userId);

  const result = await graphClient
    .api(`/sites/${siteId}/lists/${userSkillsListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${safeUserId}'`)
    .top(1)
    .get();

  if (!result.value.length) {
    return null;
  }

  const fields = result.value[0].fields;
  return {
    itemId: result.value[0].id,
    ...fields,
    TechnicalSkills: normalizeMultiValue(fields.TechnicalSkills),
    SoftSkills: normalizeMultiValue(fields.SoftSkills),
    Tools: normalizeMultiValue(fields.Tools),
    Certifications: normalizeMultiValue(fields.Certifications),
  };
}
