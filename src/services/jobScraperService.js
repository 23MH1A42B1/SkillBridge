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
  
  // Return mocks with artificial delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        jobs: mockJobsResponse.slice(0, count || 3),
        total: mockJobsResponse.length,
        source: 'Mock Fallback'
      });
    }, 1500);
  });
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
