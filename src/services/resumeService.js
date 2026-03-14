// src/services/resumeService.js
// Phase 3 — Resume upload + AI parsing + SharePoint UserSkills save.
//
// Flow:
//  1. uploadResume()      → uploads PDF/DOCX to SharePoint /Resumes/{userId}/
//  2. extractTextFromFile() → reads file text client-side (PDF via pdf.js, DOCX via mammoth)
//  3. analyzeResumeWithAI() → calls Claude API with ATS scoring prompt
//  4. saveUserSkills()    → writes extracted skills + scores to UserSkills list
//  5. The exported analyzeAndSave() ties all 4 steps together

import graphClient from './graphClient';
import { getSiteId, getListIdByName } from './userService';

// ── Claude API key — store in .env as VITE_CLAUDE_API_KEY ────
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';
const CLAUDE_MODEL   = 'claude-sonnet-4-20250514';

// ── helpers ──────────────────────────────────────────────────

function escapeODataValue(value) {
  return String(value).replace(/'/g, "''");
}

function normalizeMultiValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string')
    return value.split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
  return [];
}

// ── 1. Upload resume file to SharePoint ──────────────────────

export async function uploadResume(userId, file) {
  if (!userId) throw new Error('UserID is required to upload a resume.');
  if (!file)   throw new Error('No file provided.');

  const siteId        = await getSiteId();
  const safeFileName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  const uploaded = await graphClient
    .api(
      `/sites/${siteId}/drive/root:/Resumes/${encodeURIComponent(userId)}/${encodeURIComponent(safeFileName)}:/content`
    )
    .put(file);

  return {
    id:     uploaded.id,
    name:   uploaded.name,
    webUrl: uploaded.webUrl,
    size:   uploaded.size,
  };
}

// ── 2. Extract plain text from PDF or DOCX (client-side) ────

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    return extractTextFromPDF(file);
  } else if (ext === 'docx') {
    return extractTextFromDOCX(file);
  } else {
    // Plain text fallback
    return file.text();
  }
}

async function extractTextFromPDF(file) {
  try {
    // Dynamically import pdf.js from CDN to keep bundle small
    const pdfjsLib = await import(
      /* webpackIgnore: true */
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs'
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text          = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }

    return text.trim();
  } catch (err) {
    console.warn('[ResumeService] PDF extraction failed, using fallback:', err.message);
    return `[PDF file: ${file.name} — text extraction failed. Skills will be estimated.]`;
  }
}

async function extractTextFromDOCX(file) {
  try {
    const mammoth     = await import('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js');
    const arrayBuffer = await file.arrayBuffer();
    const result      = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (err) {
    console.warn('[ResumeService] DOCX extraction failed, using fallback:', err.message);
    return `[DOCX file: ${file.name} — text extraction failed. Skills will be estimated.]`;
  }
}

// ── 3. Analyse resume with Claude AI ─────────────────────────

export async function analyzeResumeWithAI(resumeText, desiredRole = '') {
  if (!CLAUDE_API_KEY) {
    console.warn('[ResumeService] No Claude API key — using mock analysis');
    return buildMockAnalysis(resumeText);
  }

  const prompt = buildAIPrompt(resumeText, desiredRole);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':            'application/json',
      'x-api-key':               CLAUDE_API_KEY,
      'anthropic-version':       '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data   = await response.json();
  const raw    = data.content?.[0]?.text || '{}';
  const clean  = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    console.error('[ResumeService] JSON parse failed, raw:', clean);
    return buildMockAnalysis(resumeText);
  }
}

function buildAIPrompt(resumeText, desiredRole) {
  return `You are an expert ATS resume analyzer for SkillBridge, an AI-powered placement portal.

Analyze the resume below. Return ONLY a valid JSON object.
No markdown, no code blocks, no explanation — just raw JSON.

DESIRED ROLE: ${desiredRole || 'Not specified'}

RESUME TEXT:
"""
${resumeText.slice(0, 6000)}
"""

Return exactly this JSON structure:
{
  "name": "full name or empty string",
  "email": "email or empty string",
  "phone": "phone or empty string",
  "profileScore": <number 0-100 based on resume quality>,
  "overallATSScore": <number 0-100 ATS optimization score>,
  "atsGrade": "A|B|C|D|F",
  "atsSummary": "one sentence ATS verdict",
  "summary": "2-3 sentence professional summary",
  "technicalSkills": ["Python","React","SQL"...],
  "softSkills": ["Communication","Leadership"...],
  "tools": ["Git","Docker","VS Code"...],
  "certifications": ["AWS Certified"...],
  "suggestedRoles": ["Full Stack Developer","Data Analyst"...],
  "atsSubScores": {
    "keywordMatch": <0-100>,
    "sectionCompleteness": <0-100>,
    "formatParsability": <0-100>,
    "quantifiableImpact": <0-100>,
    "actionVerbs": <0-100>,
    "contactInfo": <0-100>
  },
  "keywordsFound": ["React","Node.js"...],
  "keywordsMissing": ["TypeScript","Docker"...],
  "improvements": [
    {"priority":"Critical|Important|Minor","issue":"...","fix":"..."}
  ],
  "strengths": ["Strong technical section"...]
}

Scoring rules:
- profileScore: 90+ for rich resume, 70-89 good, 50-69 basic, below 50 sparse
- overallATSScore = weighted: keyword(35%) + section(20%) + format(20%) + impact(15%) + verbs(5%) + contact(5%)
- Grade: A=85+, B=70-84, C=55-69, D=40-54, F below 40
- Extract ALL skills mentioned anywhere including project descriptions
- Normalise: JS->JavaScript, ML->Machine Learning, k8s->Kubernetes`;
}

function buildMockAnalysis(resumeText) {
  // Fallback when no API key — extracts skills using regex
  const SKILLS = [
    'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','PHP','Ruby',
    'React','Angular','Vue.js','Node.js','Express.js','Django','Flask','Spring Boot',
    'HTML','CSS','Tailwind CSS','Bootstrap',
    'MongoDB','MySQL','PostgreSQL','Firebase','Redis','SQL',
    'AWS','Azure','Google Cloud','Docker','Kubernetes','Terraform','CI/CD','Git',
    'Machine Learning','Deep Learning','TensorFlow','PyTorch','NLP','AI',
    'Power BI','Tableau','Data Analysis','Pandas','NumPy',
    'REST API','GraphQL','Microservices','Figma','UI/UX',
    'Power Apps','Power Automate','SharePoint',
  ];

  const lower   = resumeText.toLowerCase();
  const found   = SKILLS.filter(s =>
    new RegExp(`\\b${s.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)
  );
  const tech    = found.filter(s => !['Communication','Leadership','Teamwork'].includes(s));
  const score   = Math.min(40 + tech.length * 4, 95);

  return {
    name: '', email: '', phone: '',
    profileScore: score,
    overallATSScore: Math.max(score - 10, 30),
    atsGrade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D',
    atsSummary: 'Mock analysis — add VITE_CLAUDE_API_KEY for real AI scoring.',
    summary: 'Resume uploaded and basic skill extraction complete.',
    technicalSkills: tech.slice(0, 12),
    softSkills: ['Communication', 'Problem Solving'],
    tools: tech.filter(s => ['Git','Docker','VS Code','Jira','Postman'].includes(s)),
    certifications: [],
    suggestedRoles: ['Software Developer', 'Full Stack Developer'],
    atsSubScores: {
      keywordMatch: score,
      sectionCompleteness: 70,
      formatParsability: 80,
      quantifiableImpact: 50,
      actionVerbs: 60,
      contactInfo: 70,
    },
    keywordsFound: tech.slice(0, 8),
    keywordsMissing: [],
    improvements: [
      { priority: 'Important', issue: 'Add Claude API key for real AI analysis', fix: 'Set VITE_CLAUDE_API_KEY in your .env file' },
    ],
    strengths: tech.length > 5 ? ['Good technical skill coverage'] : ['Resume uploaded successfully'],
  };
}

// ── 4. Save parsed skills to SharePoint UserSkills list ──────

export async function saveUserSkills(userId, analysis, resumeWebUrl) {
  const siteId        = await getSiteId();
  const skillsListId  = await getListIdByName('UserSkills');
  const safeUserId    = escapeODataValue(userId);

  const fields = {
    UserID:           userId,
    TechnicalSkills:  JSON.stringify(analysis.technicalSkills  || []),
    SoftSkills:       JSON.stringify(analysis.softSkills       || []),
    Tools:            JSON.stringify(analysis.tools            || []),
    Certifications:   JSON.stringify(analysis.certifications   || []),
    ProfileScore:     analysis.profileScore      || 0,
    ATSScore:         analysis.overallATSScore   || 0,
    ATSGrade:         analysis.atsGrade          || '',
    ATSSummary:       analysis.atsSummary        || '',
    ProfileSummary:   analysis.summary           || '',
    SuggestedRoles:   JSON.stringify(analysis.suggestedRoles   || []),
    KeywordsFound:    JSON.stringify(analysis.keywordsFound    || []),
    KeywordsMissing:  JSON.stringify(analysis.keywordsMissing  || []),
    Improvements:     JSON.stringify(analysis.improvements     || []),
    ResumeURL:        resumeWebUrl || '',
    LastParsedDate:   new Date().toISOString(),
    IsProfileComplete: true,
  };

  // Check if UserSkills record already exists for this user
  const existing = await graphClient
    .api(`/sites/${siteId}/lists/${skillsListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${safeUserId}'`)
    .top(1)
    .get();

  if (existing.value.length > 0) {
    // Update existing record
    const itemId = existing.value[0].id;
    await graphClient
      .api(`/sites/${siteId}/lists/${skillsListId}/items/${itemId}/fields`)
      .patch(fields);
    return { itemId, ...fields };
  } else {
    // Create new record
    const created = await graphClient
      .api(`/sites/${siteId}/lists/${skillsListId}/items`)
      .post({ fields });
    return { itemId: created.id, ...fields };
  }
}

// ── 5. Main export — full pipeline ───────────────────────────

export async function analyzeAndSave(userId, file, desiredRole = '') {
  // Step 1 — Upload file to SharePoint
  const uploadResult = await uploadResume(userId, file);

  // Step 2 — Extract text
  const resumeText = await extractTextFromFile(file);

  // Step 3 — AI analysis
  const analysis = await analyzeResumeWithAI(resumeText, desiredRole);

  // Step 4 — Save to SharePoint UserSkills list
  const saved = await saveUserSkills(userId, analysis, uploadResult.webUrl);

  return {
    upload:   uploadResult,
    analysis,
    saved,
  };
}

// ── 6. Fetch skills from SharePoint (used by Profile, Dashboard) ──

export async function getUserSkills(userId) {
  const siteId       = await getSiteId();
  const skillsListId = await getListIdByName('UserSkills');
  const safeUserId   = escapeODataValue(userId);

  const result = await graphClient
    .api(`/sites/${siteId}/lists/${skillsListId}/items`)
    .expand('fields')
    .filter(`fields/UserID eq '${safeUserId}'`)
    .top(1)
    .get();

  if (!result.value.length) return null;

  const fields = result.value[0].fields;
  return {
    itemId:          result.value[0].id,
    ...fields,
    TechnicalSkills: normalizeMultiValue(
      tryParse(fields.TechnicalSkills)
    ),
    SoftSkills:      normalizeMultiValue(tryParse(fields.SoftSkills)),
    Tools:           normalizeMultiValue(tryParse(fields.Tools)),
    Certifications:  normalizeMultiValue(tryParse(fields.Certifications)),
    SuggestedRoles:  normalizeMultiValue(tryParse(fields.SuggestedRoles)),
    KeywordsFound:   normalizeMultiValue(tryParse(fields.KeywordsFound)),
    KeywordsMissing: normalizeMultiValue(tryParse(fields.KeywordsMissing)),
    Improvements:    tryParse(fields.Improvements) || [],
  };
}

function tryParse(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return value; }
}
