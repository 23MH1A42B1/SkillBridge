#!/usr/bin/env node
/**
 * SkillBridge Job Scraper
 * Fetches real job listings from SerpAPI (Google Jobs) and saves them to Firebase Firestore.
 *
 * Usage:
 *   node scripts/scrapeJobs.js [query] [location] [count]
 *
 * Examples:
 *   node scripts/scrapeJobs.js "React Developer" India 15
 *   node scripts/scrapeJobs.js "Full Stack Engineer" "Bangalore" 10
 *   node scripts/scrapeJobs.js "Python Developer" Remote 20
 */

import 'dotenv/config';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config from CLI args ─────────────────────────────────────────────────────
const query    = process.argv[2] || 'Software Developer';
const location = process.argv[3] || 'India';
const count    = parseInt(process.argv[4] || '10', 10);

// ─── Environment ──────────────────────────────────────────────────────────────
const SERP_API_KEY              = process.env.SERP_API_KEY;
const FIREBASE_SERVICE_ACCOUNT  = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  || join(__dirname, '..', 'firebase-service-account.json');

if (!SERP_API_KEY) {
  console.error('❌  SERP_API_KEY is not set in .env');
  process.exit(1);
}

// ─── Firebase Admin init ──────────────────────────────────────────────────────
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(FIREBASE_SERVICE_ACCOUNT, 'utf8'));
} catch (e) {
  console.error(`❌  Could not read service account at: ${FIREBASE_SERVICE_ACCOUNT}`);
  console.error('    Make sure firebase-service-account.json is in the project root.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ─── Skill extraction helpers ─────────────────────────────────────────────────
const SKILL_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring', 'C#', '.NET', 'Go', 'Rust',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Firestore',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'Git', 'REST', 'GraphQL', 'HTML', 'CSS', 'Tailwind', 'Next.js', 'Vite',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'NLP',
  'Figma', 'Agile', 'Scrum', 'Linux', 'DevOps', 'Microservices'
];

function extractSkills(text = '') {
  const upper = text.toUpperCase();
  return SKILL_KEYWORDS.filter(skill => upper.includes(skill.toUpperCase()));
}

function extractExperience(extensions = []) {
  return extensions.find(e =>
    /\d.*year|yr|experience/i.test(e)
  ) || null;
}

function extractSalary(extensions = []) {
  return extensions.find(e =>
    /₹|\$|lpa|lakh|salary|per year|per month/i.test(e)
  ) || null;
}

// ─── SerpAPI fetch ────────────────────────────────────────────────────────────
async function fetchJobsFromSerpAPI(q, loc, maxCount) {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine',  'google_jobs');
  url.searchParams.set('q',       q);
  url.searchParams.set('location', loc);
  url.searchParams.set('api_key', SERP_API_KEY);
  url.searchParams.set('hl',      'en');
  url.searchParams.set('num',     String(maxCount));

  console.log(`\n🔍  Querying SerpAPI: "${q}" in "${loc}" (up to ${maxCount} jobs)...`);

  const res  = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  const jobs = data.jobs_results || [];
  console.log(`📦  SerpAPI returned ${jobs.length} raw results.`);
  return jobs.slice(0, maxCount);
}

// ─── Normalise raw SerpAPI job ────────────────────────────────────────────────
function normaliseJob(raw, queryStr) {
  const extensions   = raw.extensions || [];
  const description  = raw.description || '';
  const combinedText = `${raw.title} ${raw.company_name} ${description} ${extensions.join(' ')}`;

  const detected = extractSkills(combinedText);
  const required = detected.length > 0
    ? detected.slice(0, 6)
    : queryStr.split(/\s+/).filter(Boolean);

  const preferred = detected.length > 6
    ? detected.slice(6, 12)
    : ['Problem Solving', 'Communication', 'Teamwork'];

  // Priority: apply_options = direct company career page / job board links
  // related_links = Google search results links (less useful)
  const applyOptions = (raw.apply_options || []).map(opt => ({
    title: opt.title || 'Apply',
    link:  opt.link
  })).filter(opt => opt.link);

  const directUrl = applyOptions[0]?.link          // e.g. "Apply on LinkedIn", "Apply on Naukri"
    || raw.related_links?.[0]?.link                // fallback: Google related link
    || null;

  return {
    jobId:          raw.job_id || `serp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title:          raw.title || 'Unknown Title',
    company:        raw.company_name || 'Unknown Company',
    location:       raw.location || location,
    source:         raw.via || 'Google Jobs',
    salary:         extractSalary(extensions),
    experience:     extractExperience(extensions),
    url:            directUrl,
    applyOptions:   applyOptions,           // all direct apply links
    description:    description.slice(0, 500) || null,
    requiredSkills:  required,
    preferredSkills: preferred,
    scrapedAt:      new Date().toISOString(),
    searchQuery:    queryStr,
    searchLocation: location
  };
}

// ─── Save to Firestore ─────────────────────────────────────────────────────────
async function saveJobsToFirestore(jobs) {
  console.log(`\n💾  Saving ${jobs.length} jobs to Firestore liveJobs collection...`);

  let saved = 0;
  let errors = 0;

  for (const job of jobs) {
    try {
      await db.collection('liveJobs').doc(job.jobId).set(job, { merge: true });
      process.stdout.write('.');
      saved++;
    } catch (err) {
      process.stdout.write('✗');
      errors++;
      console.error(`\n  ⚠️  Failed to save ${job.jobId}: ${err.message}`);
    }
  }

  console.log('');
  return { saved, errors };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   SkillBridge Job Scraper');
  console.log('═══════════════════════════════════════════════');

  try {
    const rawJobs     = await fetchJobsFromSerpAPI(query, location, count);
    const normalised  = rawJobs.map(job => normaliseJob(job, query));
    console.log(`✅  Normalised ${normalised.length} jobs.`);

    const { saved, errors } = await saveJobsToFirestore(normalised);

    console.log('\n═══════════════════════════════════════════════');
    console.log(`✅  Done! Saved ${saved} jobs to Firestore.`);
    if (errors > 0) console.log(`⚠️   ${errors} jobs failed to save.`);
    console.log(`📌  Collection: liveJobs`);
    console.log(`🔗  View at: https://console.firebase.google.com/project/skillbridge-84575/firestore`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌  Scraper failed:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

main();
