// ============================================
// SkillBridge — SharePoint Integration Service
// ============================================
// Connects to SharePoint Online via Microsoft Graph API
// Used for: storing resumes, user data, job records
//
// In production, replace SHAREPOINT_CONFIG with real values
// and use MSAL.js for auth. This module provides the full
// integration layer with simulated fallbacks for demo.

const SHAREPOINT_CONFIG = {
  siteUrl: 'https://yourtenant.sharepoint.com/sites/SkillBridge',
  clientId: 'YOUR_APP_CLIENT_ID',
  tenantId: 'YOUR_TENANT_ID',
  listNames: {
    students: 'Students',
    companies: 'Companies',
    jobs: 'Jobs',
    applications: 'Applications',
    scrapedJobs: 'ScrapedJobs',
    emailLogs: 'EmailLogs',
  },
  resumeLibrary: 'StudentResumes',
};

let accessToken = null;

// ---- Auth ----
export async function getAccessToken() {
  if (accessToken) return accessToken;
  // In production: use MSAL.js popup/redirect flow
  // const msalInstance = new PublicClientApplication(msalConfig);
  // const response = await msalInstance.acquireTokenSilent({ scopes: ['Sites.ReadWrite.All'] });
  // accessToken = response.accessToken;
  console.log('[SharePoint] Auth: Using demo mode — no real token');
  accessToken = 'DEMO_TOKEN';
  return accessToken;
}

// ---- Generic Graph API helpers ----
async function graphGet(endpoint) {
  const token = await getAccessToken();
  if (token === 'DEMO_TOKEN') {
    console.log(`[SharePoint] GET ${endpoint} (demo mode)`);
    return null;
  }
  const res = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Graph API error: ${res.status}`);
  return res.json();
}

async function graphPost(endpoint, body) {
  const token = await getAccessToken();
  if (token === 'DEMO_TOKEN') {
    console.log(`[SharePoint] POST ${endpoint}`, body);
    return { id: `SP_${Date.now()}`, ...body };
  }
  const res = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Graph API error: ${res.status}`);
  return res.json();
}

// ---- List Operations ----
function listEndpoint(listName) {
  return `/sites/root/lists/${listName}/items`;
}

export async function getListItems(listName) {
  return graphGet(`${listEndpoint(listName)}?expand=fields`);
}

export async function addListItem(listName, fields) {
  return graphPost(listEndpoint(listName), { fields });
}

// ---- Student CRUD ----
export async function saveStudent(student) {
  return addListItem(SHAREPOINT_CONFIG.listNames.students, {
    Title: student.name,
    Email: student.email,
    Phone: student.phone,
    University: student.university,
    Branch: student.branch,
    Year: student.year,
    Skills: JSON.stringify(student.skills),
    Certifications: JSON.stringify(student.certifications),
    Projects: JSON.stringify(student.projects),
    Internships: JSON.stringify(student.internships),
    Avatar: student.avatar,
  });
}

export async function getStudents() {
  const data = await getListItems(SHAREPOINT_CONFIG.listNames.students);
  if (!data) return null;
  return data.value.map(item => ({
    id: item.id,
    name: item.fields.Title,
    email: item.fields.Email,
    skills: JSON.parse(item.fields.Skills || '[]'),
    university: item.fields.University,
    branch: item.fields.Branch,
    year: item.fields.Year,
  }));
}

// ---- Company CRUD ----
export async function saveCompany(company) {
  return addListItem(SHAREPOINT_CONFIG.listNames.companies, {
    Title: company.name,
    Email: company.email,
    Industry: company.industry,
    Location: company.location,
    Website: company.website,
    Description: company.description,
  });
}

// ---- Job CRUD ----
export async function saveJob(job) {
  return addListItem(SHAREPOINT_CONFIG.listNames.jobs, {
    Title: job.title,
    CompanyId: job.companyId,
    CompanyName: job.companyName,
    Description: job.description,
    RequiredSkills: JSON.stringify(job.requiredSkills),
    PreferredSkills: JSON.stringify(job.preferredSkills),
    Location: job.location,
    Salary: job.salary,
    Source: job.source || 'Portal',
    SourceUrl: job.sourceUrl || '',
  });
}

// ---- Scraped Jobs ----
export async function saveScrapedJob(job) {
  return addListItem(SHAREPOINT_CONFIG.listNames.scrapedJobs, {
    Title: job.title,
    Company: job.company,
    Platform: job.platform,
    Skills: JSON.stringify(job.skills),
    Url: job.url,
    ScrapedAt: new Date().toISOString(),
  });
}

// ---- Resume Upload ----
export async function uploadResume(studentId, file) {
  const token = await getAccessToken();
  if (token === 'DEMO_TOKEN') {
    console.log(`[SharePoint] Upload resume for ${studentId}: ${file.name} (demo mode)`);
    return {
      id: `FILE_${Date.now()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      webUrl: `${SHAREPOINT_CONFIG.siteUrl}/${SHAREPOINT_CONFIG.resumeLibrary}/${studentId}_${file.name}`,
    };
  }
  const uploadUrl = `/sites/root/drive/root:/${SHAREPOINT_CONFIG.resumeLibrary}/${studentId}_${file.name}:/content`;
  const res = await fetch(`https://graph.microsoft.com/v1.0${uploadUrl}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Resume upload failed: ${res.status}`);
  return res.json();
}

// ---- Email Log ----
export async function logEmailSent(record) {
  return addListItem(SHAREPOINT_CONFIG.listNames.emailLogs, {
    Title: record.subject,
    StudentEmail: record.to,
    JobTitle: record.jobTitle,
    Platform: record.platform,
    SentAt: new Date().toISOString(),
    Status: record.status || 'Sent',
  });
}

// ---- Stats for Admin ----
export async function getSharePointStats() {
  // In demo mode we return null so the app falls back to local data
  const students = await getListItems(SHAREPOINT_CONFIG.listNames.students);
  const jobs = await getListItems(SHAREPOINT_CONFIG.listNames.jobs);
  const applications = await getListItems(SHAREPOINT_CONFIG.listNames.applications);
  const scraped = await getListItems(SHAREPOINT_CONFIG.listNames.scrapedJobs);
  const emails = await getListItems(SHAREPOINT_CONFIG.listNames.emailLogs);

  if (!students) return null;

  return {
    totalStudents: students.value?.length || 0,
    totalJobs: jobs?.value?.length || 0,
    totalApplications: applications?.value?.length || 0,
    totalScrapedJobs: scraped?.value?.length || 0,
    totalEmailsSent: emails?.value?.length || 0,
  };
}

export { SHAREPOINT_CONFIG };
