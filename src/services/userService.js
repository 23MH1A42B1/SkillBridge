// src/services/userService.js
// Handles all SharePoint Users list operations.
// getSiteId and getListIdByName are exported so other
// services (resumeService, matchService) can reuse them.

import graphClient from './graphClient';

const SHAREPOINT_HOSTNAME  = 'adityagroup.sharepoint.com';
const SHAREPOINT_SITE_PATH = '/sites/SkillBridge';

let siteIdCache = null;
const listIdCache = new Map();

// ── helpers ──────────────────────────────────────────────────

export function getAzureObjectId(account) {
  return (
    account?.idTokenClaims?.oid ||
    account?.localAccountId ||
    account?.homeAccountId ||
    ''
  );
}

function escapeODataValue(value) {
  return String(value).replace(/'/g, "''");
}

export async function getSiteId() {
  if (siteIdCache) return siteIdCache;
  const site = await graphClient
    .api(`/sites/${SHAREPOINT_HOSTNAME}:${SHAREPOINT_SITE_PATH}`)
    .select('id')
    .get();
  siteIdCache = site.id;
  return siteIdCache;
}

export async function getListIdByName(listName) {
  if (listIdCache.has(listName)) return listIdCache.get(listName);
  const siteId = await getSiteId();
  const response = await graphClient.api(`/sites/${siteId}/lists`).get();
  const list = response.value.find(
    (entry) => entry.displayName === listName || entry.name === listName
  );
  if (!list) throw new Error(`SharePoint list not found: ${listName}`);
  listIdCache.set(listName, list.id);
  return list.id;
}

// ── user operations ──────────────────────────────────────────

export async function getUserByUserId(userId) {
  const siteId        = await getSiteId();
  const usersListId   = await getListIdByName('Users');
  const safeUserId    = escapeODataValue(userId);

  const result = await graphClient
    .api(`/sites/${siteId}/lists/${usersListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${safeUserId}'`)
    .top(1)
    .get();

  if (!result.value.length) return null;
  const item = result.value[0];
  return { itemId: item.id, ...item.fields };
}

export async function ensureUserRegistered(account) {
  const userId = getAzureObjectId(account);
  if (!userId) throw new Error('Unable to resolve Azure AD object ID.');

  const siteId      = await getSiteId();
  const usersListId = await getListIdByName('Users');
  const safeUserId  = escapeODataValue(userId);
  const nowIso      = new Date().toISOString();

  const existing = await graphClient
    .api(`/sites/${siteId}/lists/${usersListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${safeUserId}'`)
    .top(1)
    .get();

  if (!existing.value.length) {
    const created = await graphClient
      .api(`/sites/${siteId}/lists/${usersListId}/items`)
      .post({
        fields: {
          UserID:             userId,
          FullName:           account?.name || '',
          Email:              account?.username || '',
          Phone:              '',
          College:            '',
          DesiredRole:        '',
          LocationPreference: '',
          IsProfileComplete:  false,
          Role:               'Candidate',
          Status:             'Active',
          RegisteredAt:       nowIso,
          LastLoginAt:        nowIso,
        },
      });
    return { itemId: created.id, ...created.fields };
  }

  const item = existing.value[0];
  await graphClient
    .api(`/sites/${siteId}/lists/${usersListId}/items/${item.id}/fields`)
    .patch({ LastLoginAt: nowIso });

  return { itemId: item.id, ...item.fields, LastLoginAt: nowIso };
}

export async function updateUserProfile(itemId, fields) {
  const siteId      = await getSiteId();
  const usersListId = await getListIdByName('Users');
  return graphClient
    .api(`/sites/${siteId}/lists/${usersListId}/items/${itemId}/fields`)
    .patch(fields);
}
