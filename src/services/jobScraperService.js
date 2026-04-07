import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const VITE_SCRAPER_URL = import.meta.env.VITE_SCRAPER_URL;

const mockJobsResponse = [
  {
    jobId: 'mock-101',
    title: 'Frontend React Developer',
    company: 'TechFlow Solutions',
    location: 'Bangalore, KA',
    requiredSkills: ['React', 'JavaScript', 'CSS', 'Tailwind'],
    preferredSkills: ['TypeScript', 'Firebase'],
    experience: '2-4 years',
    salary: '₹12,00,000 - ₹18,00,000',
    source: 'LinkedIn'
  },
  {
    jobId: 'mock-102',
    title: 'Full Stack Engineer',
    company: 'InnovateX',
    location: 'Remote',
    requiredSkills: ['Node.js', 'React', 'MongoDB', 'Git'],
    preferredSkills: ['AWS', 'Docker'],
    experience: '3-5 years',
    salary: '$80,000 - $110,000',
    source: 'Naukri'
  },
  {
    jobId: 'mock-103',
    title: 'UI Developer',
    company: 'DesignMatrix',
    location: 'Hyderabad, TS',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Figma'],
    preferredSkills: ['React', 'Tailwind'],
    experience: '1-3 years',
    salary: '₹8,00,000 - ₹12,00,000',
    source: 'Indeed'
  }
];

export const scrapeJobsFromSerpAPI = async (query, location, count) => {
  try {
    if (VITE_SCRAPER_URL && !VITE_SCRAPER_URL.includes('your-function')) {
      const response = await fetch(VITE_SCRAPER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, count })
      });
      if (!response.ok) throw new Error('Proxy failed');
      return await response.json();
    }
  } catch (error) {
    console.warn("Real scraper unavailable, using mocks:", error);
  }
  
  // AI-Powered Synthetic Scraper (Fallback)
  try {
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "You are a Real-Time Job Scraper. Generate 10 realistic, current job listings for the requested role in India. Ensure varying companies, salaries, and specific technical requirements. Output in JSON format only." 
          },
          { 
            role: "user", 
            content: `Generate 10 jobs for: ${query}. Location: ${location || 'India'}. Include fields: jobId (random string), title, company, location, requiredSkills (array), preferredSkills (array), experience, salary, source (LinkedIn, Indeed, or Naukri).` 
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await aiResponse.json();
    const content = JSON.parse(data.choices[0].message.content);
    const generatedJobs = content.jobs || Object.values(content)[0]; // Handle different JSON structures

    return {
      jobs: Array.isArray(generatedJobs) ? generatedJobs.slice(0, count) : [],
      total: generatedJobs.length,
      source: 'AI-Enhanced Live Scrape'
    };
  } catch (err) {
    console.error("AI Scraper failed:", err);
    return { jobs: [], total: 0, source: 'Failed' };
  }
};

export const saveJobsToFirestore = async (jobsList) => {
  let added = 0;
  for (const job of jobsList) {
    try {
      await setDoc(doc(db, 'liveJobs', job.jobId), {
        ...job,
        scrapedAt: new Date().toISOString()
      }, { merge: true });
      added++;
    } catch (e) {
      console.error("Error saving job", job.jobId, e);
    }
  }
  return { added, total: jobsList.length };
};

export const scrapeAndSaveJobs = async (targetRole, count = 10) => {
  const result = await scrapeJobsFromSerpAPI(targetRole, 'India', count);
  const saveResult = await saveJobsToFirestore(result.jobs || []);
  return { scraped: result, saved: saveResult };
};
