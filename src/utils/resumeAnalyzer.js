// ============================================
// SkillBridge — Resume Analyzer Engine
// ============================================
// Parses resume text, extracts skills, and provides analysis.
// In production, can integrate with Azure Cognitive Services
// or a custom NLP API for better extraction.

import { KNOWN_SKILLS } from '../services/jobScraperService';
import { calculateMatchScore, analyzeSkillGap } from './matchingEngine';

// ---- Parse Resume Text ----
export function parseResumeText(text) {
  if (!text || typeof text !== 'string') return null;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  return {
    rawText: text,
    skills: extractSkills(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    name: extractName(lines),
    education: extractEducation(text),
    experience: extractExperience(text),
    certifications: extractCertifications(text),
    links: extractLinks(text),
    wordCount: text.split(/\s+/).length,
    analyzedAt: new Date().toISOString(),
  };
}

// ---- Skill Extraction ----
function extractSkills(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = KNOWN_SKILLS.filter(skill => {
    const pattern = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${pattern}\\b`, 'i').test(lower);
  });
  return [...new Set(found)];
}

// ---- Email Extraction ----
function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

// ---- Phone Extraction ----
function extractPhone(text) {
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : null;
}

// ---- Name Extraction (first non-empty line) ----
function extractName(lines) {
  // Heuristic: first line that looks like a name (2-4 words, no special chars)
  for (const line of lines.slice(0, 5)) {
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){0,3}$/.test(line) && line.split(' ').length <= 4) {
      return line;
    }
  }
  return lines[0] || 'Unknown';
}

// ---- Education Extraction ----
function extractEducation(text) {
  const keywords = ['B.Tech', 'B.E.', 'M.Tech', 'M.E.', 'BCA', 'MCA', 'BSc', 'MSc', 'MBA', 'PhD',
    'Bachelor', 'Master', 'IIT', 'NIT', 'IIIT', 'VIT', 'BITS', 'DTU', 'University', 'College',
    'Computer Science', 'Information Technology', 'Electronics', 'Engineering'];
  const lines = text.split('\n');
  const eduLines = lines.filter(line =>
    keywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()))
  );
  return eduLines.map(l => l.trim()).filter(Boolean).slice(0, 5);
}

// ---- Experience / Internship Extraction ----
function extractExperience(text) {
  const keywords = ['intern', 'developer', 'engineer', 'analyst', 'designer', 'consultant',
    'worked at', 'experience', 'employment', 'company'];
  const lines = text.split('\n');
  const expLines = lines.filter(line =>
    keywords.some(kw => line.toLowerCase().includes(kw))
  );
  return expLines.map(l => l.trim()).filter(Boolean).slice(0, 10);
}

// ---- Certification Extraction ----
function extractCertifications(text) {
  const keywords = ['certified', 'certification', 'certificate', 'AWS', 'Azure', 'Google',
    'Meta', 'IBM', 'Oracle', 'Microsoft', 'Coursera', 'Udemy', 'edX'];
  const lines = text.split('\n');
  const certLines = lines.filter(line =>
    keywords.some(kw => line.toLowerCase().includes(kw))
  );
  return certLines.map(l => l.trim()).filter(Boolean).slice(0, 10);
}

// ---- Link Extraction ----
function extractLinks(text) {
  const urlRegex = /https?:\/\/[^\s<]+/g;
  return text.match(urlRegex) || [];
}

// ---- Generate Resume Score ----
export function scoreResume(parsedResume) {
  let score = 0;
  const feedback = [];

  // Skills (40 points)
  const skillCount = parsedResume.skills.length;
  if (skillCount >= 8) { score += 40; feedback.push({ area: 'Skills', score: 40, max: 40, note: 'Excellent skill coverage' }); }
  else if (skillCount >= 5) { score += 30; feedback.push({ area: 'Skills', score: 30, max: 40, note: 'Good, consider adding more niche skills' }); }
  else if (skillCount >= 3) { score += 20; feedback.push({ area: 'Skills', score: 20, max: 40, note: 'Add more relevant technical skills' }); }
  else { score += 10; feedback.push({ area: 'Skills', score: 10, max: 40, note: 'Very few skills detected — add more' }); }

  // Education (15 points)
  if (parsedResume.education.length > 0) { score += 15; feedback.push({ area: 'Education', score: 15, max: 15, note: 'Education info found' }); }
  else { feedback.push({ area: 'Education', score: 0, max: 15, note: 'No education details detected' }); }

  // Experience (20 points)
  if (parsedResume.experience.length >= 2) { score += 20; feedback.push({ area: 'Experience', score: 20, max: 20, note: 'Multiple experiences listed' }); }
  else if (parsedResume.experience.length >= 1) { score += 12; feedback.push({ area: 'Experience', score: 12, max: 20, note: 'Consider adding more projects/internships' }); }
  else { feedback.push({ area: 'Experience', score: 0, max: 20, note: 'No experience detected — add internships/projects' }); }

  // Contact (10 points)
  let contactScore = 0;
  if (parsedResume.email) contactScore += 5;
  if (parsedResume.phone) contactScore += 5;
  score += contactScore;
  feedback.push({ area: 'Contact Info', score: contactScore, max: 10, note: contactScore === 10 ? 'Email and phone found' : 'Add complete contact info' });

  // Certifications (10 points)
  if (parsedResume.certifications.length > 0) { score += 10; feedback.push({ area: 'Certifications', score: 10, max: 10, note: `${parsedResume.certifications.length} certification(s) found` }); }
  else { feedback.push({ area: 'Certifications', score: 0, max: 10, note: 'Consider adding certifications' }); }

  // Length (5 points)
  if (parsedResume.wordCount >= 150 && parsedResume.wordCount <= 800) { score += 5; feedback.push({ area: 'Length', score: 5, max: 5, note: 'Good resume length' }); }
  else if (parsedResume.wordCount < 150) { feedback.push({ area: 'Length', score: 0, max: 5, note: 'Resume is too short — add more detail' }); }
  else { score += 3; feedback.push({ area: 'Length', score: 3, max: 5, note: 'Resume is quite long — consider trimming' }); }

  return { totalScore: score, maxScore: 100, feedback };
}

// ---- Match Resume Against All Jobs ----
export function matchResumeToJobs(parsedResume, jobs, minScore = 40) {
  return jobs
    .map(job => {
      const matchScore = calculateMatchScore(parsedResume.skills, job.requiredSkills, job.preferredSkills || []);
      const gap = analyzeSkillGap(parsedResume.skills, job.requiredSkills, job.preferredSkills || []);
      return { ...job, matchScore, gap };
    })
    .filter(j => j.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ---- Read File As Text (client-side) ----
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
