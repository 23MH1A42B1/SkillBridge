// ============================================
// SkillBridge — Skill Matching Engine
// ============================================

/**
 * Calculate match percentage between a student's skills and a job's required/preferred skills.
 * Returns a score from 0-100.
 */
export function calculateMatchScore(studentSkills, requiredSkills, preferredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) return 0;

  const studentSet = new Set(studentSkills.map(s => s.toLowerCase()));

  // Required skills match (weighted 70%)
  const requiredMatches = requiredSkills.filter(skill =>
    studentSet.has(skill.toLowerCase())
  ).length;
  const requiredScore = (requiredMatches / requiredSkills.length) * 70;

  // Preferred skills match (weighted 30%)
  let preferredScore = 0;
  if (preferredSkills.length > 0) {
    const preferredMatches = preferredSkills.filter(skill =>
      studentSet.has(skill.toLowerCase())
    ).length;
    preferredScore = (preferredMatches / preferredSkills.length) * 30;
  } else {
    preferredScore = requiredScore > 0 ? 15 : 0; // Bonus if no preferred skills listed
  }

  return Math.round(requiredScore + preferredScore);
}

/**
 * Find matching jobs for a student based on their skills.
 * Returns jobs sorted by match score (descending).
 */
export function findMatchingJobs(student, jobs, minScore = 40) {
  return jobs
    .map(job => ({
      ...job,
      matchScore: calculateMatchScore(student.skills, job.requiredSkills, job.preferredSkills),
    }))
    .filter(job => job.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Find matching students for a job based on required skills.
 * Returns students sorted by match score (descending).
 */
export function findMatchingStudents(job, students, minScore = 40) {
  return students
    .map(student => ({
      ...student,
      matchScore: calculateMatchScore(student.skills, job.requiredSkills, job.preferredSkills),
    }))
    .filter(s => s.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Analyze skill gaps for a student against a specific job.
 * Returns { matched, missing, preferred }
 */
export function analyzeSkillGap(studentSkills, requiredSkills, preferredSkills = []) {
  const studentSet = new Set(studentSkills.map(s => s.toLowerCase()));

  const matched = requiredSkills.filter(s => studentSet.has(s.toLowerCase()));
  const missing = requiredSkills.filter(s => !studentSet.has(s.toLowerCase()));
  const hasPreferred = preferredSkills.filter(s => studentSet.has(s.toLowerCase()));
  const missingPreferred = preferredSkills.filter(s => !studentSet.has(s.toLowerCase()));

  return { matched, missing, hasPreferred, missingPreferred };
}

/**
 * Get overall skill demand statistics from all jobs.
 */
export function getSkillDemandStats(jobs) {
  const skillCount = {};
  jobs.forEach(job => {
    [...job.requiredSkills, ...job.preferredSkills].forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });

  return Object.entries(skillCount)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get placement statistics.
 */
export function getPlacementStats(students, jobs) {
  const totalStudents = students.length;
  const studentsWithApplications = students.filter(s => s.appliedJobs.length > 0).length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const totalApplications = students.reduce((sum, s) => sum + s.appliedJobs.length, 0);

  // Average match score across all student-job pairs
  let totalMatchScores = 0;
  let matchCount = 0;
  students.forEach(student => {
    jobs.forEach(job => {
      const score = calculateMatchScore(student.skills, job.requiredSkills, job.preferredSkills);
      if (score > 0) {
        totalMatchScores += score;
        matchCount++;
      }
    });
  });

  const avgMatchScore = matchCount > 0 ? Math.round(totalMatchScores / matchCount) : 0;

  return {
    totalStudents,
    studentsWithApplications,
    totalJobs,
    activeJobs,
    totalApplications,
    avgMatchScore,
    placementRate: totalStudents > 0 ? Math.round((studentsWithApplications / totalStudents) * 100) : 0,
  };
}
