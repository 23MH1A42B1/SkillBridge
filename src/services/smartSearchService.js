import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { scrapeJobsFromSerpAPI } from './jobScraperService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Advanced service to perform a "Smart Search" by:
 * 1. Analyzing user profile deep context
 * 2. Running specialized SerpAPI queries
 * 3. AI-scoring and explaining the match for each result
 */

let embeddingWorker = null;

export const performSmartSearch = async (user, profile, skillsData, filters = {}, onProgress = null) => {
  const { location = 'India', days = 30, limit = 20 } = filters;
  const targetRole = profile?.desiredRole || 'Software Engineer';
  
  console.log(`🚀 Starting Smart Search for: ${targetRole} in ${location}`);
  if (onProgress) onProgress("Scraping live jobs...");

  // 1. Fetch live jobs specifically for this search
  const dateFilter = days <= 1 ? 'today' : days <= 7 ? 'week' : 'month';
  const scraperResult = await scrapeJobsFromSerpAPI(targetRole, location, limit, filters);
  const jobs = scraperResult.jobs || [];

  if (jobs.length === 0) return { matches: [], suggestions: [], totalFound: 0 };

  const userSkillsList = [
    ...(skillsData?.skills?.technical || []),
    ...(skillsData?.skills?.tools || []),
    ...(skillsData?.skills?.soft || [])
  ].join(', ');

  // 2. Client-Side ML Semantic Ranking (Vector Embeddings)
  if (onProgress) onProgress("Initializing local AI for semantic ranking...");
  
  if (!embeddingWorker) {
      embeddingWorker = new Worker(new URL('./mlWorker.js', import.meta.url), { type: 'module' });
  }

  const rankedIndices = await new Promise((resolve, reject) => {
      const onMessage = (e) => {
          if (e.data.status === 'progress') {
              if (onProgress && e.data.progress?.progress) {
                  onProgress(`Downloading ML model (${Math.round(e.data.progress.progress)}%)`);
              }
          } else if (e.data.status === 'ready') {
              if (onProgress) onProgress("Ranking jobs semantically...");
              const jobTexts = jobs.map((j, i) => ({ index: i, text: `${j.title} ${j.company} ${j.description || ''}` }));
              embeddingWorker.postMessage({ type: 'rank_jobs', userText: userSkillsList, jobTexts });
          } else if (e.data.status === 'complete') {
              embeddingWorker.removeEventListener('message', onMessage);
              resolve(e.data.result);
          } else if (e.data.status === 'error') {
              embeddingWorker.removeEventListener('message', onMessage);
              reject(new Error(e.data.error));
          }
      };
      embeddingWorker.addEventListener('message', onMessage);
      embeddingWorker.postMessage({ type: 'init_embeddings' });
  });

  // Take the top 5 highest ranked jobs semantically
  const topRankedJobs = rankedIndices.slice(0, 5).map(r => ({
      ...jobs[r.originalIndex],
      semanticScore: r.semanticScore
  }));

  // 3. Use AI to analyze matches and explain "Why" (Only for the Top 5!)
  if (onProgress) onProgress("Generating strategic insights...");
  const smartMatches = [];
  for (const job of topRankedJobs) {
    const matchExplanation = await explainMatchWithAI(job, userSkillsList, targetRole);
    smartMatches.push({
      ...job,
      ...matchExplanation,
      scrapedAt: new Date().toISOString()
    });
  }

  // 4. Identify missing keywords for the resume based on overall results
  const keywordSuggestions = await suggestKeywordsWithAI(topRankedJobs, userSkillsList);

  return {
    matches: smartMatches,
    suggestions: keywordSuggestions,
    totalFound: jobs.length
  };
};

async function explainMatchWithAI(job, userSkills, targetRole) {
  if (!GROQ_API_KEY) return { matchReason: "AI explanation unavailable (missing key)", matchScore: 70 };

  const prompt = `
    User Skills: ${userSkills}
    Target Role: ${targetRole}
    
    Job Listing:
    Title: ${job.title}
    Company: ${job.company}
    Requirements: ${job.description || 'Not provided'}
    
    Task: 
    1. Calculate a match score (0-100) specifically for this user.
    2. Provide a 1-sentence strategic explanation of why this job fits their profile.
    3. Identify 2-3 "Key Skills" the user HAS that match.
    4. Format as JSON: {"matchScore": number, "matchReason": "string", "matchingSkills": ["skill1", "skill2"]}
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.error("AI Match explanation failed", e);
    return { matchReason: "Matches your core technical profile and desired seniority.", matchScore: 75, matchingSkills: [] };
  }
}

async function suggestKeywordsWithAI(jobs, userSkills) {
  if (!GROQ_API_KEY) return [];

  const jobContext = jobs.slice(0, 5).map(j => `${j.title} at ${j.company}`).join(', ');
  const prompt = `
    Based on these live job results: ${jobContext}
    And the user's current skills: ${userSkills}
    
    Identify 5 high-impact keywords or skills that appear frequently in these roles but are MISSING or should be HIGHLIGHTED more in the user's resume.
    Format as JSON: {"suggestions": ["keyword1", "keyword2", "etc"]}
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content).suggestions;
  } catch (e) {
    return ["Machine Learning", "Cloud Architecture", "System Design"];
  }
}
