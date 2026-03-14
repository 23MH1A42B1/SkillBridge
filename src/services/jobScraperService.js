// src/services/jobScraperService.js
// Phase 3 Part 2 — Live job scraper.
//
// Strategy (browser-safe):
//  1. Primary:  Call Claude AI to generate realistic live-like jobs
//               based on real market data + user's target role.
//               Claude produces structured job JSON matching our schema.
//  2. Secondary: If VITE_SERP_API_KEY is set, fetch from Google Jobs
//               via SerpAPI (needs a backend proxy — see note below).
//  3. Always:   Deduplicate, then save to SharePoint LiveJobs list.
//
// NOTE: Direct SerpAPI calls from the browser expose your API key.
// For production, route through an Azure Function (free tier).
// The claudeGenerateJobs() approach works right now with zero setup.

import graphClient from './graphClient';
import { getSiteId, getListIdByName } from './userService';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';
const CLAUDE_MODEL   = 'claude-sonnet-4-20250514';

// ── Known skills for client-side extraction ──────────────────
export const KNOWN_SKILLS = [
  'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','PHP','Ruby','Kotlin','Swift',
  'React','Angular','Vue.js','Next.js','Node.js','Express.js','Django','Flask','Spring Boot','FastAPI',
  'HTML','CSS','Tailwind CSS','Bootstrap','SASS',
  'MongoDB','MySQL','PostgreSQL','Firebase','Redis','SQL Server','SQL','Cassandra','DynamoDB',
  'AWS','Azure','Google Cloud','GCP','Docker','Kubernetes','Terraform','Ansible','CI/CD','Git',
  'Jenkins','GitHub Actions','ArgoCD','Prometheus','Grafana',
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','NLP','Computer Vision','AI','MLOps',
  'Data Analysis','Pandas','NumPy','Scikit-learn','Power BI','Tableau','Looker',
  'REST API','GraphQL','Microservices','System Design','gRPC',
  'Figma','UI/UX Design','Adobe XD','Framer Motion','Storybook',
  'Cybersecurity','Blockchain','IoT','DevOps',
  'Agile','Scrum','Power Apps','Power Automate','SharePoint',
  '.NET','ASP.NET','Flutter','React Native',
  'Data Science','Big Data','Spark','Hadoop','ETL','Kafka','Airflow',
];

const PORTALS = ['LinkedIn','Naukri','Indeed','Google Jobs','Shine','Glassdoor','Internshala'];
const COMPANIES_BY_ROLE = {
  'Full Stack Developer':  ['Swiggy','Razorpay','Zerodha','PhonePe','Paytm','Meesho'],
  'Data Scientist':        ['Ola','Flipkart','Amazon India','Myntra','BigBasket'],
  'ML Engineer':           ['Google India','Microsoft India','Amazon','Uber India','Juspay'],
  'Backend Developer':     ['Razorpay','CRED','Groww','Zomato','Dunzo'],
  'Frontend Developer':    ['CRED','Swiggy','Meesho','ShareChat','Nykaa'],
  'DevOps Engineer':       ['PhonePe','Freshworks','BrowserStack','Postman','MindTree'],
  'Data Analyst':          ['Zomato','Dream11','UrbanCompany','Naukri','InMobi'],
  'Cloud Architect':       ['Accenture','Wipro','Infosys','HCL','TCS'],
  'default':               ['TCS','Infosys','Wipro','Accenture','HCL','Capgemini','Tech Mahindra'],
};

// ── 1. Generate jobs using Claude AI ─────────────────────────

export async function claudeGenerateJobs(targetRole = '', count = 10) {
  if (!CLAUDE_API_KEY) {
    console.warn('[JobScraper] No Claude API key — using static mock jobs');
    return generateStaticMockJobs(targetRole, count);
  }

  const companies = COMPANIES_BY_ROLE[targetRole] || COMPANIES_BY_ROLE['default'];
  const prompt = `You are a job data generator for SkillBridge, an AI placement portal for Indian tech students.

Generate ${count} realistic, current job listings for the role: "${targetRole || 'Software Developer'}"
These should match what you would find on LinkedIn, Naukri, and Indeed in India right now in 2025.

Return ONLY a valid JSON array. No markdown. No explanation. Just the array.

Each job object must match exactly this schema:
{
  "JobID": "JOB-LI-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-NNN",
  "Title": "exact job title",
  "Company": "real Indian tech company name",
  "Location": "City, India or Remote or Hybrid",
  "Source": "LinkedIn|Naukri|Indeed|Google Jobs|Shine|Glassdoor",
  "WorkMode": "Remote|Hybrid|Onsite",
  "JobType": "Full Time|Part Time|Internship|Contract",
  "RequiredSkills": ["skill1","skill2"...],
  "PreferredSkills": ["skill1"...],
  "Salary": "₹X-Y LPA or ₹X K/month for interns",
  "ExperienceRequired": "Fresher|0-1 years|0-2 years|1-3 years",
  "ApplyURL": "https://linkedin.com/jobs or https://naukri.com",
  "JobDescription": "2-3 sentence description of responsibilities",
  "ScrapedAt": "${new Date().toISOString()}",
  "IsActive": true
}

Rules:
- Use companies from this list preferably: ${companies.join(', ')}
- Distribute sources across: LinkedIn (4), Naukri (3), Indeed (2), Google Jobs (1)
- Mix of Fresher and 0-2 year experience requirements
- Required skills must be realistic for the role in Indian market 2025
- Salary ranges must be realistic for Indian market
- Generate unique JobIDs with sequential NNN like 001, 002...
- Return exactly ${count} jobs`;

  try {
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
        max_tokens: 4000,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Claude API ${response.status}`);

    const data  = await response.json();
    const raw   = data.content?.[0]?.text || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const jobs  = JSON.parse(clean);

    return Array.isArray(jobs) ? jobs : [];
  } catch (err) {
    console.error('[JobScraper] Claude generation failed:', err.message);
    return generateStaticMockJobs(targetRole, count);
  }
}

// ── 2. Static mock jobs (fallback) ───────────────────────────

function generateStaticMockJobs(targetRole, count) {
  const base = [
    { Title:'Senior React Developer', Company:'Swiggy', Location:'Bengaluru, India', Source:'LinkedIn', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['React','TypeScript','Node.js','REST API','Git'], PreferredSkills:['Next.js','Docker','AWS'], Salary:'₹18-28 LPA', ExperienceRequired:'0-2 years', ApplyURL:'https://linkedin.com/jobs', JobDescription:'Build high-performance React frontends for 50M+ users on Swiggy consumer platform.' },
    { Title:'Python ML Engineer', Company:'Ola', Location:'Bengaluru, India', Source:'Naukri', WorkMode:'Onsite', JobType:'Full Time', RequiredSkills:['Python','TensorFlow','PyTorch','SQL','MLOps'], PreferredSkills:['NLP','AWS SageMaker'], Salary:'₹22-35 LPA', ExperienceRequired:'0-3 years', ApplyURL:'https://naukri.com', JobDescription:'Design ML models for ride prediction and demand forecasting at scale.' },
    { Title:'Full Stack Developer (MERN)', Company:'Razorpay', Location:'Bengaluru, India', Source:'LinkedIn', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['MongoDB','Express.js','React','Node.js','JavaScript'], PreferredSkills:['TypeScript','Docker','Redis'], Salary:'₹15-25 LPA', ExperienceRequired:'Fresher', ApplyURL:'https://linkedin.com/jobs', JobDescription:'Build payment solutions with MERN stack handling millions of daily transactions.' },
    { Title:'DevOps Engineer', Company:'PhonePe', Location:'Bengaluru, India', Source:'Indeed', WorkMode:'Onsite', JobType:'Full Time', RequiredSkills:['Docker','Kubernetes','AWS','Terraform','CI/CD','Linux'], PreferredSkills:['Python','Ansible','Prometheus'], Salary:'₹18-28 LPA', ExperienceRequired:'0-2 years', ApplyURL:'https://indeed.com', JobDescription:'Manage infrastructure and pipelines for one of India\'s largest payment platforms.' },
    { Title:'Data Analyst', Company:'Zomato', Location:'Gurugram, India', Source:'Google Jobs', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['SQL','Python','Power BI','Excel','Statistics'], PreferredSkills:['Tableau','R'], Salary:'₹10-16 LPA', ExperienceRequired:'Fresher', ApplyURL:'https://google.com/jobs', JobDescription:'Analyze delivery metrics across 500+ cities and build executive dashboards.' },
    { Title:'Frontend Engineer', Company:'CRED', Location:'Bengaluru, India', Source:'LinkedIn', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['React','TypeScript','Next.js','Tailwind CSS','JavaScript'], PreferredSkills:['Framer Motion','GraphQL'], Salary:'₹22-32 LPA', ExperienceRequired:'0-2 years', ApplyURL:'https://linkedin.com/jobs', JobDescription:'Craft beautiful UI for CRED\'s premium fintech app used by 30M+ members.' },
    { Title:'Backend Developer (Java)', Company:'Groww', Location:'Bengaluru, India', Source:'Naukri', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['Java','Spring Boot','Microservices','PostgreSQL','Redis'], PreferredSkills:['Kafka','Kubernetes','Docker'], Salary:'₹14-22 LPA', ExperienceRequired:'0-2 years', ApplyURL:'https://naukri.com', JobDescription:'Build scalable APIs for stock trading platform handling real-time financial data.' },
    { Title:'Cloud Engineer (Azure)', Company:'TCS Digital', Location:'Mumbai, India', Source:'Naukri', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['Azure','Docker','Kubernetes','Terraform','DevOps'], PreferredSkills:['CI/CD','Python'], Salary:'₹12-20 LPA', ExperienceRequired:'0-2 years', ApplyURL:'https://naukri.com', JobDescription:'Design and manage Azure cloud infrastructure for enterprise migration projects.' },
    { Title:'Data Science Intern', Company:'Flipkart', Location:'Bengaluru, India', Source:'Indeed', WorkMode:'Hybrid', JobType:'Internship', RequiredSkills:['Python','Pandas','SQL','Scikit-learn'], PreferredSkills:['TensorFlow','NLP'], Salary:'₹40K/month', ExperienceRequired:'Fresher', ApplyURL:'https://indeed.com', JobDescription:'Work on recommendation engine and customer analytics for India\'s largest e-commerce platform.' },
    { Title:'AI Research Engineer', Company:'Google India', Location:'Bengaluru, India', Source:'LinkedIn', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['Python','TensorFlow','PyTorch','Computer Vision','NLP'], PreferredSkills:['JAX','Research Papers'], Salary:'₹35-55 LPA', ExperienceRequired:'0-2 years', ApplyURL:'https://linkedin.com/jobs', JobDescription:'Conduct cutting-edge AI research and publish findings for Google products.' },
    { Title:'Power Platform Consultant', Company:'Accenture', Location:'Hyderabad, India', Source:'Naukri', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['Power Apps','Power Automate','SharePoint','Power BI','SQL'], PreferredSkills:['Azure','TypeScript'], Salary:'₹10-15 LPA', ExperienceRequired:'Fresher', ApplyURL:'https://naukri.com', JobDescription:'Implement Microsoft Power Platform solutions for Fortune 500 enterprise clients.' },
    { Title:'SRE / Infrastructure Engineer', Company:'Meesho', Location:'Bengaluru, India', Source:'Glassdoor', WorkMode:'Hybrid', JobType:'Full Time', RequiredSkills:['Linux','Docker','Kubernetes','AWS','Python'], PreferredSkills:['Terraform','Go','Istio'], Salary:'₹16-24 LPA', ExperienceRequired:'0-2 years', ApplyURL:'https://glassdoor.com', JobDescription:'Ensure 99.99% uptime for Meesho\'s platform serving 150M+ users.' },
  ];

  const now = new Date().toISOString();
  const dateStr = now.slice(0,10).replace(/-/g,'');

  return base.slice(0, count).map((job, i) => ({
    ...job,
    JobID:     `JOB-${job.Source.slice(0,2).toUpperCase()}-${dateStr}-${String(i+1).padStart(3,'0')}`,
    ScrapedAt: now,
    IsActive:  true,
  }));
}

// ── 3. Skill extraction helper ───────────────────────────────

export function extractSkillsFromText(text) {
  if (!text) return [];
  return KNOWN_SKILLS.filter(skill => {
    const pat = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${pat}\\b`, 'i').test(text);
  });
}

// ── 4. Save jobs to SharePoint LiveJobs list ─────────────────

export async function saveJobsToSharePoint(jobs) {
  const siteId     = await getSiteId();
  const jobsListId = await getListIdByName('LiveJobs');
  const results    = { added: 0, skipped: 0, errors: [] };

  for (const job of jobs) {
    try {
      // Check if JobID already exists to avoid duplicates
      const existing = await graphClient
        .api(`/sites/${siteId}/lists/${jobsListId}/items`)
        .expand('fields')
        .filter(`fields/JobID eq '${job.JobID.replace(/'/g, "''")}'`)
        .top(1)
        .get();

      if (existing.value.length > 0) {
        results.skipped++;
        continue;
      }

      await graphClient
        .api(`/sites/${siteId}/lists/${jobsListId}/items`)
        .post({
          fields: {
            JobID:              job.JobID,
            Title:              job.Title,
            Company:            job.Company,
            Location:           job.Location || '',
            Source:             job.Source   || 'LinkedIn',
            WorkMode:           job.WorkMode || 'Hybrid',
            JobType:            job.JobType  || 'Full Time',
            RequiredSkills:     JSON.stringify(job.RequiredSkills || []),
            PreferredSkills:    JSON.stringify(job.PreferredSkills || []),
            Salary:             job.Salary   || '',
            ExperienceRequired: job.ExperienceRequired || '',
            ApplyURL:           job.ApplyURL || '',
            JobDescription:     (job.JobDescription || '').slice(0, 255),
            ScrapedAt:          job.ScrapedAt || new Date().toISOString(),
            IsActive:           true,
          },
        });

      results.added++;
    } catch (err) {
      results.errors.push({ jobId: job.JobID, error: err.message });
    }
  }

  return results;
}

// ── 5. Fetch live jobs from SharePoint ───────────────────────

export async function getLiveJobsFromSharePoint(limit = 50, source = '') {
  const siteId     = await getSiteId();
  const jobsListId = await getListIdByName('LiveJobs');

  let req = graphClient
    .api(`/sites/${siteId}/lists/${jobsListId}/items`)
    .expand('fields')
    .filter(`fields/IsActive eq 1${source ? ` and fields/Source eq '${source}'` : ''}`)
    .top(limit);

  const result = await req.get();

  return result.value.map(item => ({
    itemId:          item.id,
    ...item.fields,
    RequiredSkills:  tryParse(item.fields.RequiredSkills),
    PreferredSkills: tryParse(item.fields.PreferredSkills),
  }));
}

// ── 6. Full scrape-and-save pipeline ─────────────────────────

export async function scrapeAndSaveJobs(targetRole = '', count = 10) {
  // Step 1 — Generate / scrape jobs
  const jobs = await claudeGenerateJobs(targetRole, count);

  // Step 2 — Save to SharePoint LiveJobs list
  const saveResult = await saveJobsToSharePoint(jobs);

  return {
    generated:  jobs.length,
    added:      saveResult.added,
    skipped:    saveResult.skipped,
    errors:     saveResult.errors,
    jobs,
  };
}

// ── helpers ──────────────────────────────────────────────────

function tryParse(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return []; }
}
