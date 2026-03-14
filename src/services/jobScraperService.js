// ============================================
// SkillBridge — Job Scraper Service
// ============================================
// Scrapes jobs from LinkedIn, Naukri, Indeed, etc.
// Uses SERP API (or similar) + simulated data for demo
//
// In production: set SERP_API_KEY and use a backend proxy
// to avoid CORS / key exposure. Never call SERP API directly
// from the browser—route through your own server or
// Power Automate HTTP connector.

const SCRAPER_CONFIG = {
  serpApiKey: 'YOUR_SERP_API_KEY', // Replace in production
  serpApiBase: 'https://serpapi.com/search.json',
  platforms: ['LinkedIn', 'Naukri', 'Indeed', 'Glassdoor', 'Internshala'],
};

function isDemoMode() {
  return SCRAPER_CONFIG.serpApiKey === 'YOUR_SERP_API_KEY';
}

// ---- SERP API Job Search ----
export async function searchJobsViaSerpApi(query, location = 'India') {
  if (isDemoMode()) {
    console.log(`[JobScraper] DEMO — Searching: "${query}" in ${location}`);
    return generateMockScrapedJobs(query, location);
  }

  // Production: this should go through your backend proxy
  const params = new URLSearchParams({
    engine: 'google_jobs',
    q: query,
    location,
    api_key: SCRAPER_CONFIG.serpApiKey,
  });

  try {
    const res = await fetch(`${SCRAPER_CONFIG.serpApiBase}?${params}`);
    if (!res.ok) throw new Error(`SERP API error: ${res.status}`);
    const data = await res.json();

    return (data.jobs_results || []).map(job => ({
      id: `SCRAPE_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: job.title,
      company: job.company_name,
      location: job.location,
      description: job.description || '',
      skills: extractSkillsFromText(job.description || ''),
      platform: detectPlatform(job.via || ''),
      url: job.apply_options?.[0]?.link || job.share_link || '#',
      postedAt: job.detected_extensions?.posted_at || 'Recently',
      salary: job.detected_extensions?.salary || 'Not disclosed',
      type: job.detected_extensions?.schedule_type || 'Full-time',
      scrapedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[JobScraper] SERP API failed:', err);
    return generateMockScrapedJobs(query, location);
  }
}

// ---- Skill Extraction from Job Description ----
const KNOWN_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Angular', 'Vue.js', 'Vue', 'Node.js', 'Express.js', 'Express', 'Django', 'Flask', 'Spring Boot',
  'HTML', 'CSS', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'SASS',
  'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase', 'Redis', 'SQL Server', 'SQL',
  'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
  'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'AI',
  'Data Analysis', 'Pandas', 'NumPy', 'Power BI', 'Tableau',
  'REST API', 'GraphQL', 'Microservices', 'System Design',
  'Figma', 'UI/UX Design', 'Adobe XD',
  'Cybersecurity', 'Blockchain', 'IoT', 'DevOps',
  'Agile', 'Scrum', 'Power Apps', 'Power Automate', 'SharePoint',
  '.NET', 'ASP.NET', 'Kotlin', 'Swift', 'Flutter', 'React Native',
  'Data Science', 'Big Data', 'Spark', 'Hadoop', 'ETL', 'Data Engineering',
];

export function extractSkillsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter(skill => {
    const pattern = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${pattern}\\b`, 'i').test(lower);
  });
}

function detectPlatform(viaText) {
  const text = (viaText || '').toLowerCase();
  if (text.includes('linkedin')) return 'LinkedIn';
  if (text.includes('naukri')) return 'Naukri';
  if (text.includes('indeed')) return 'Indeed';
  if (text.includes('glassdoor')) return 'Glassdoor';
  if (text.includes('internshala')) return 'Internshala';
  return 'Other';
}

// ---- Mock Data Generator ----
function generateMockScrapedJobs(query, location) {
  const queryLower = query.toLowerCase();
  const mockJobs = [
    {
      title: 'Senior React Developer',
      company: 'Swiggy',
      location: 'Bangalore, India',
      description: 'Build high-performance frontends with React, TypeScript, and Tailwind CSS. Experience with REST API, Git, and CI/CD required.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST API', 'Git', 'CI/CD', 'JavaScript'],
      platform: 'LinkedIn',
      url: 'https://linkedin.com/jobs/view/example-1',
      salary: '₹18-28 LPA',
      type: 'Full-time',
      postedAt: '2 days ago',
    },
    {
      title: 'Python ML Engineer',
      company: 'Ola',
      location: 'Bangalore, India',
      description: 'Work on ML models using Python, TensorFlow, Deep Learning. Experience with NLP and Data Analysis preferred.',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Deep Learning', 'NLP', 'Data Analysis'],
      platform: 'Naukri',
      url: 'https://naukri.com/job/example-2',
      salary: '₹22-35 LPA',
      type: 'Full-time',
      postedAt: '1 day ago',
    },
    {
      title: 'Full Stack Developer (MERN)',
      company: 'Razorpay',
      location: 'Bangalore, India',
      description: 'Build payment solutions with MongoDB, Express.js, React, Node.js. Docker and AWS knowledge is a plus.',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Docker', 'AWS'],
      platform: 'LinkedIn',
      url: 'https://linkedin.com/jobs/view/example-3',
      salary: '₹15-25 LPA',
      type: 'Full-time',
      postedAt: '3 days ago',
    },
    {
      title: 'Power Platform Consultant',
      company: 'Accenture',
      location: 'Hyderabad, India',
      description: 'Build enterprise solutions using Power Apps, Power Automate, SharePoint, and Azure. C# and TypeScript experience preferred.',
      skills: ['Power Apps', 'Power Automate', 'SharePoint', 'Azure', 'C#', 'TypeScript'],
      platform: 'Naukri',
      url: 'https://naukri.com/job/example-4',
      salary: '₹12-20 LPA',
      type: 'Full-time',
      postedAt: '5 hours ago',
    },
    {
      title: 'DevOps Engineer',
      company: 'PhonePe',
      location: 'Pune, India',
      description: 'Manage Docker, Kubernetes, AWS, CI/CD, Terraform. Jenkins and GitHub Actions experience required.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Jenkins', 'GitHub Actions', 'Git'],
      platform: 'Indeed',
      url: 'https://indeed.com/viewjob/example-5',
      salary: '₹16-24 LPA',
      type: 'Full-time',
      postedAt: '4 days ago',
    },
    {
      title: 'Data Analyst',
      company: 'Zomato',
      location: 'Gurgaon, India',
      description: 'Analyze business data using Python, SQL, Power BI, Tableau. Pandas and NumPy proficiency required.',
      skills: ['Python', 'SQL', 'Power BI', 'Tableau', 'Pandas', 'NumPy', 'Data Analysis'],
      platform: 'LinkedIn',
      url: 'https://linkedin.com/jobs/view/example-6',
      salary: '₹10-16 LPA',
      type: 'Full-time',
      postedAt: '1 day ago',
    },
    {
      title: 'Backend Developer — Java',
      company: 'Paytm',
      location: 'Noida, India',
      description: 'Build scalable microservices using Java, Spring Boot, MySQL, Docker. Experience with REST API and System Design.',
      skills: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'Docker', 'REST API', 'System Design'],
      platform: 'Naukri',
      url: 'https://naukri.com/job/example-7',
      salary: '₹14-22 LPA',
      type: 'Full-time',
      postedAt: '6 hours ago',
    },
    {
      title: 'UI/UX Engineer',
      company: 'CRED',
      location: 'Bangalore, India',
      description: 'Design beautiful interfaces with Figma, React, HTML, CSS, Tailwind CSS. UI/UX Design certification preferred.',
      skills: ['Figma', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'UI/UX Design', 'JavaScript'],
      platform: 'Glassdoor',
      url: 'https://glassdoor.com/job/example-8',
      salary: '₹12-20 LPA',
      type: 'Full-time',
      postedAt: '2 days ago',
    },
    {
      title: 'Cloud Engineer — Azure',
      company: 'TCS',
      location: 'Mumbai, India',
      description: 'Manage Azure cloud infrastructure, DevOps pipelines, Kubernetes, Docker, Terraform.',
      skills: ['Azure', 'Docker', 'Kubernetes', 'Terraform', 'DevOps', 'CI/CD'],
      platform: 'Naukri',
      url: 'https://naukri.com/job/example-9',
      salary: '₹10-18 LPA',
      type: 'Full-time',
      postedAt: '3 days ago',
    },
    {
      title: 'AI Research Intern',
      company: 'Google',
      location: 'Bangalore, India',
      description: 'Work on cutting-edge AI research using Python, PyTorch, Deep Learning, NLP, Computer Vision.',
      skills: ['Python', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision', 'Machine Learning'],
      platform: 'LinkedIn',
      url: 'https://linkedin.com/jobs/view/example-10',
      salary: '₹50K/month stipend',
      type: 'Internship',
      postedAt: '12 hours ago',
    },
  ];

  // Filter by query relevance
  const relevant = mockJobs.filter(job => {
    const text = `${job.title} ${job.skills.join(' ')} ${job.description}`.toLowerCase();
    const words = queryLower.split(/\s+/);
    return words.some(w => w.length > 2 && text.includes(w));
  });

  const results = (relevant.length > 0 ? relevant : mockJobs).map(job => ({
    ...job,
    id: `SCRAPE_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    scrapedAt: new Date().toISOString(),
  }));

  return results;
}

// ---- Multi-Platform Search ----
export async function scrapeAllPlatforms(query, location = 'India') {
  // In production, each platform would have its own scraper/API
  // For now, we simulate combined results
  const results = await searchJobsViaSerpApi(query, location);
  return results;
}

export { SCRAPER_CONFIG, KNOWN_SKILLS };
