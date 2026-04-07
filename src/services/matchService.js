import { doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const calculateMatchScore = (userSkills = [], requiredSkills = [], preferredSkills = []) => {
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  
  const reqMatchCount = requiredSkills.filter(s => userSkillsLower.includes(s.toLowerCase())).length;
  const reqScore = requiredSkills.length > 0 ? (reqMatchCount / requiredSkills.length) * 70 : 70;

  const prefMatchCount = preferredSkills.filter(s => userSkillsLower.includes(s.toLowerCase())).length;
  const prefScore = preferredSkills.length > 0 ? (prefMatchCount / preferredSkills.length) * 30 : 30;

  return Math.round(reqScore + prefScore);
};

export const analyzeSkillGap = (userSkills = [], requiredSkills = [], preferredSkills = []) => {
  const userSet = new Set(userSkills.map(s => s.toLowerCase()));
  const matched = [];
  const missing = [];
  const bonus = [];

  [...requiredSkills, ...preferredSkills].forEach(skill => {
    if (userSet.has(skill.toLowerCase())) matched.push(skill);
    else missing.push(skill);
  });

  userSkills.forEach(skill => {
    const isRequiredOrPref = [...requiredSkills, ...preferredSkills].some(s => s.toLowerCase() === skill.toLowerCase());
    if (!isRequiredOrPref) bonus.push(skill);
  });

  return { matched, missing, bonus };
};

export const generateMatchReasoning = async (userSkills, jobTitle, jobCompany, matchedSkills, missingSkills) => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: "You are an AI Career Consultant. Explain in 1-2 powerful sentences why this user is a great match for this job, highlighting their strengths and acknowledging gaps professionally." 
          },
          { 
            role: "user", 
            content: `User Skills: ${userSkills.join(', ')}\nJob: ${jobTitle} at ${jobCompany}\nMatched: ${matchedSkills.join(', ')}\nMissing: ${missingSkills.join(', ')}` 
          }
        ],
        temperature: 0.5
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    return "Your skills align strongly with the core requirements of this role.";
  }
};

export const saveMatchResult = async (userId, jobId, score, matched, missing, bonus, jobTitle, company, jobUrl, applyOptions, reasoning = null) => {
  const matchId = `${userId}_${jobId}`;
  await setDoc(doc(db, 'matchResults', matchId), {
    userId,
    jobId,
    jobTitle,
    company,
    jobUrl: jobUrl || null,
    applyOptions: applyOptions || [],
    matchScore: score,
    matchedSkills: matched,
    missingSkills: missing,
    bonusSkills: bonus,
    aiReasoning: reasoning,
    emailSent: false,
    timestamp: new Date().toISOString()
  });
};

export const getMyMatches = async (userId, minScore = 0, limitCount = 50) => {
  const q = query(
    collection(db, 'matchResults'), 
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(m => m.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limitCount);
};

export const getMatchById = async (matchId) => {
  const docRef = doc(db, 'matchResults', matchId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const runSkillMatchForUser = async (userId, userSkillsData, minScore = 50) => {
  const jobsSnapshot = await getDocs(collection(db, 'liveJobs'));
  let savedCount = 0;
  const topMatches = [];

  const raw = userSkillsData || {};
  const technical = Array.isArray(raw.technical) ? raw.technical : [];
  const tools     = Array.isArray(raw.tools)     ? raw.tools     : [];
  const soft      = Array.isArray(raw.soft)      ? raw.soft      : [];
  const userSkillsList = [...technical, ...tools, ...soft];

  if (userSkillsList.length === 0) {
    throw new Error('No skills found in profile. Please re-upload your resume first.');
  }

  for (const jobDoc of jobsSnapshot.docs) {
    const job = jobDoc.data();
    const req = job.requiredSkills || [];
    const pref = job.preferredSkills || [];
    
    const score = calculateMatchScore(userSkillsList, req, pref);
    
    if (score >= minScore) {
      const gap = analyzeSkillGap(userSkillsList, req, pref);
      
      // Only generate reasoning for top-tier matches to save API calls
      let reasoning = null;
      if (score >= 80) {
        reasoning = await generateMatchReasoning(userSkillsList, job.title, job.company, gap.matched, gap.missing);
      }

      await saveMatchResult(userId, job.id || jobDoc.id, score, gap.matched, gap.missing, gap.bonus, job.title, job.company, job.url, job.applyOptions, reasoning);
      savedCount++;
      topMatches.push({ jobId: jobDoc.id, score, ...job, ...gap, aiReasoning: reasoning });
    }
  }

  topMatches.sort((a, b) => b.score - a.score);
  return { totalJobsAnalyzed: jobsSnapshot.docs.length, matchesSaved: savedCount, topMatches: topMatches.slice(0, 5) };
};
