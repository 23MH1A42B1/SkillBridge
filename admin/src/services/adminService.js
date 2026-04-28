import {
  collection, getDocs, doc, getDoc, setDoc,
  query, orderBy, limit, where, Timestamp, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Users ────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserById = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserStatus = async (uid, status) => {
  await setDoc(doc(db, 'users', uid), { status }, { merge: true });
};

export const updateUserRole = async (uid, role) => {
  await setDoc(doc(db, 'users', uid), { role }, { merge: true });
};

// ── Resumes / Skills ─────────────────────────────────────────────────
export const getAllUserSkills = async () => {
  const snap = await getDocs(collection(db, 'userSkills'));
  return snap.docs.map(d => ({ userId: d.id, ...d.data() }));
};

// ── Job Matches ──────────────────────────────────────────────────────
export const getAllMatches = async () => {
  const snap = await getDocs(collection(db, 'matches'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Applications ─────────────────────────────────────────────────────
export const getAllApplications = async () => {
  const snap = await getDocs(collection(db, 'applications'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Interviews ───────────────────────────────────────────────────────
export const getAllInterviews = async () => {
  const snap = await getDocs(collection(db, 'interviews'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── System Config ────────────────────────────────────────────────────
export const getSystemConfig = async () => {
  const snap = await getDoc(doc(db, 'admin', 'systemConfig'));
  return snap.exists() ? snap.data() : getDefaultConfig();
};

export const saveSystemConfig = async (config) => {
  await setDoc(doc(db, 'admin', 'systemConfig'), {
    ...config,
    updatedAt: new Date().toISOString(),
  });
};

// ── Audit Log ────────────────────────────────────────────────────────
export const logAdminAction = async (adminEmail, action, details = {}) => {
  const logRef = doc(collection(db, 'adminLogs'));
  await setDoc(logRef, {
    adminEmail,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
};

export const getAuditLogs = async (limitN = 50) => {
  const snap = await getDocs(collection(db, 'adminLogs'));
  const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limitN);
};

// ── Aggregate Stats ──────────────────────────────────────────────────
export const getStats = async () => {
  const [users, skills, matches, applications] = await Promise.all([
    getAllUsers(),
    getAllUserSkills(),
    getAllMatches(),
    getAllApplications(),
  ]);

  const now = new Date();
  const day7  = new Date(now - 7 * 86400000);
  const day30 = new Date(now - 30 * 86400000);
  const day1  = new Date(now - 86400000);

  const activeToday = users.filter(u => u.lastLogin && new Date(u.lastLogin) >= day1).length;
  const active7d    = users.filter(u => u.lastLogin && new Date(u.lastLogin) >= day7).length;
  const active30d   = users.filter(u => u.lastLogin && new Date(u.lastLogin) >= day30).length;

  const avgAts = skills.length
    ? Math.round(skills.reduce((s, u) => s + (u.atsScore?.total || 0), 0) / skills.length)
    : 0;

  return {
    totalUsers:    users.length,
    withResumes:   skills.length,
    totalMatches:  matches.length,
    totalApps:     applications.length,
    activeToday,
    active7d,
    active30d,
    avgAtsScore:   avgAts,
    users,
    skills,
    matches,
    applications,
  };
};

// ── User signup chart data ───────────────────────────────────────────
export const getSignupTrend = (users, days = 14) => {
  const trend = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStart = new Date(d.setHours(0,0,0,0));
    const dayEnd   = new Date(d.setHours(23,59,59,999));
    const count = users.filter(u => {
      const created = u.createdAt ? new Date(u.createdAt) : null;
      return created && created >= dayStart && created <= dayEnd;
    }).length;
    trend.push({ date: label, signups: count });
  }
  return trend;
};

// Default feature flag config
function getDefaultConfig() {
  return {
    features: {
      interviewSimulator: true,
      aiResumeBuilder:    true,
      smartSearch:        true,
      negotiator:         true,
      emailAlerts:        true,
      careerReport:       true,
      linkedInOptimizer:  true,
    },
    ai: {
      model:       'llama-3.1-8b-instant',
      temperature: 0.2,
      maxTokens:   4096,
    },
    maintenance: {
      enabled: false,
      message: 'SkillBridge is under maintenance. Back soon!',
    },
    limits: {
      dailyAiCallsPerUser: 20,
      maxResumesPerUser:   5,
    },
  };
}

// ── Live Announcements ───────────────────────────────────────────────
export const pushLiveAnnouncement = async (adminEmail, message, type = 'info') => {
  await setDoc(doc(db, 'admin', 'liveAnnouncement'), {
    message,
    type,
    adminEmail,
    timestamp: new Date().toISOString(),
    id: Math.random().toString(36).substring(2, 9)
  });
  await logAdminAction(adminEmail, 'Pushed Live Announcement', { message, type });
};

// ── Token Usage ──────────────────────────────────────────────────────
export const getTokenUsage = async (days = 30) => {
  const snap = await getDocs(collection(db, 'admin', 'tokenUsage', 'daily'));
  const usage = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return usage.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-days);
};
