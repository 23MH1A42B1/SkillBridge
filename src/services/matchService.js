import { doc, setDoc, collection, query, where, getDocs, orderBy, limit, writeBatch } from 'firebase/firestore';
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

export const saveMatchResult = async (userId, jobId, score, matched, missing, bonus, jobTitle, company) => {
  const matchId = `${userId}_${jobId}`;
  await setDoc(doc(db, 'matchResults', matchId), {
    userId,
    jobId,
    jobTitle,
    company,
    matchScore: score,
    matchedSkills: matched,
    missingSkills: missing,
    bonusSkills: bonus,
    emailSent: false,
    timestamp: new Date().toISOString()
  });
};

export const getMyMatches = async (userId, minScore = 0, limitCount = 10) => {
  const q = query(
    collection(db, 'matchResults'), 
    where('userId', '==', userId), 
    where('matchScore', '>=', minScore),
    orderBy('matchScore', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const runSkillMatchForUser = async (userId, userSkillsData, minScore = 50) => {
  const jobsSnapshot = await getDocs(collection(db, 'liveJobs'));
  let savedCount = 0;
  const topMatches = [];

  const userSkillsList = [...userSkillsData.technical, ...userSkillsData.tools, ...userSkillsData.soft];

  for (const jobDoc of jobsSnapshot.docs) {
    const job = jobDoc.data();
    
    // Fallback required/preferred logic if job object is simple
    const req = job.requiredSkills || [];
    const pref = job.preferredSkills || [];
    
    const score = calculateMatchScore(userSkillsList, req, pref);
    
    if (score >= minScore) {
      const gap = analyzeSkillGap(userSkillsList, req, pref);
      await saveMatchResult(userId, job.id || jobDoc.id, score, gap.matched, gap.missing, gap.bonus, job.title, job.company);
      savedCount++;
      topMatches.push({ jobId: jobDoc.id, score, ...job, ...gap });
    }
  }

  topMatches.sort((a, b) => b.score - a.score);
  return { totalJobsAnalyzed: jobsSnapshot.docs.length, matchesSaved: savedCount, topMatches: topMatches.slice(0, 5) };
};
