import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SERP_API_KEY = process.env.SERP_API_KEY;

if (!SERP_API_KEY) {
  console.error("❌ ERROR: SERP_API_KEY is missing in your .env file!");
  console.log("Please add SERP_API_KEY=your_key_here to your .env file and run this again.");
  process.exit(1);
}

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist"
];

const fetchJobs = async (role) => {
  console.log(`🔍 Fetching jobs for: ${role}`);
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.append("engine", "google_jobs");
  url.searchParams.append("q", role);
  url.searchParams.append("api_key", SERP_API_KEY);
  url.searchParams.append("hl", "en");

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    return data.jobs_results || [];
  } catch (error) {
    console.error(`Error fetching ${role}:`, error);
    return [];
  }
};

const extractSkillsFromDescription = (description, role) => {
  const commonSkills = ["React", "JavaScript", "Node.js", "Python", "SQL", "Figma", "TypeScript", "AWS", "Docker", "Java", "C++", "HTML", "CSS", "Git"];
  const desc = description.toLowerCase();
  
  const found = commonSkills.filter(skill => desc.includes(skill.toLowerCase()));
  if (found.length === 0) {
    if (role.includes("Frontend")) return ["React", "JavaScript", "CSS", "HTML"];
    if (role.includes("Data")) return ["Python", "SQL"];
    return ["JavaScript", "Problem Solving"];
  }
  return found;
};

const seed = async () => {
  let totalSaved = 0;
  console.log("🚀 Starting Live Jobs Sync...");
  
  for (const role of ROLES) {
    const jobs = await fetchJobs(role);
    console.log(`   Found ${jobs.length} jobs for ${role}`);
    
    for (const job of jobs) {
      if (!job.job_id) continue;
      
      const skills = extractSkillsFromDescription(job.description || "", role);
      
      const jobObject = {
        title: job.title,
        company: job.company_name,
        location: job.location,
        source: job.via || "Google Jobs",
        salary: job.extensions?.find(e => e.includes('₹') || e.includes('$')) || "Not disclosed",
        experience: job.extensions?.find(e => e.includes('year') || e.includes('yr')) || "Entry/Mid Level",
        url: job.related_links?.[0]?.link || "#",
        requiredSkills: skills,
        preferredSkills: ["Communication", "Teamwork"],
        description: job.description?.substring(0, 500) + '...',
        updatedAt: new Date().toISOString()
      };
      
      try {
        await setDoc(doc(db, "liveJobs", job.job_id), jobObject);
        totalSaved++;
      } catch (err) {
         console.log("\n❌ Firestore error! Your database rules might be blocking the save.");
         console.log("Wait! To fix this, go to Firebase Console > Firestore Database > Rules.");
         console.log("Change them to: match /{document=**} { allow read, write: if true; }");
         console.error(err.message);
         process.exit(1);
      }
    }
  }
  
  console.log(`\n✅ Success! Saved ${totalSaved} live jobs into Firebase!`);
  process.exit(0);
};

seed();
