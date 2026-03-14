import { createContext, useContext, useState, useCallback } from 'react';
import {
  users as initialUsers,
  userSkills as initialUserSkills,
  liveJobs as initialLiveJobs,
  matchResults as initialMatchResults,
  emailLogs as initialEmailLogs,
  adminSettings as initialAdminSettings,
  skillGapReport as initialSkillGapReport,
  auditLog as initialAuditLog,
  savedJobs as initialSavedJobs,
  notifications as initialNotifications,
  emailPreferences as initialEmailPreferences,
} from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState(initialUsers);
  const [userSkillsList, setUserSkillsList] = useState(initialUserSkills);
  const [liveJobs, setLiveJobs] = useState(initialLiveJobs);
  const [matchResultsList, setMatchResults] = useState(initialMatchResults);
  const [emailLogsList, setEmailLogs] = useState(initialEmailLogs);
  const [settings, setSettings] = useState(initialAdminSettings);
  const [skillGapData, setSkillGapData] = useState(initialSkillGapReport);
  const [auditLogList, setAuditLog] = useState(initialAuditLog);
  const [savedJobsList, setSavedJobs] = useState(initialSavedJobs);
  const [notificationsList, setNotifications] = useState(initialNotifications);
  const [emailPrefsList, setEmailPrefs] = useState(initialEmailPreferences);
  const [currentUser, setCurrentUser] = useState(null);

  // ─── Auth ─────────────────────────────────────────────────
  const login = useCallback((userID, role = 'candidate') => {
    const user = users.find(u => u.UserID === userID);
    if (user) setCurrentUser({ ...user, role });
  }, [users]);

  const loginAsAdmin = useCallback(() => {
    setCurrentUser({ UserID: 'ADMIN', Name: 'Admin', Email: 'admin@skillbridge.edu', role: 'admin' });
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  const registerUser = useCallback((userData) => {
    const id = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser = { ...userData, UserID: id, Status: 'Active', RegisteredDate: new Date().toISOString().split('T')[0] };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, [users.length]);

  // ─── UserSkills ───────────────────────────────────────────
  const updateUserSkills = useCallback((userID, skillData) => {
    setUserSkillsList(prev => {
      const exists = prev.find(s => s.UserID === userID);
      if (exists) return prev.map(s => s.UserID === userID ? { ...s, ...skillData, LastParsedDate: new Date().toISOString() } : s);
      return [...prev, { UserID: userID, ...skillData, LastParsedDate: new Date().toISOString(), IsProfileComplete: true }];
    });
  }, []);

  // ─── Jobs ─────────────────────────────────────────────────
  const addScrapedJobs = useCallback((jobs) => {
    setLiveJobs(prev => {
      const ids = new Set(prev.map(j => j.JobID));
      return [...prev, ...jobs.filter(j => !ids.has(j.JobID))];
    });
  }, []);

  // ─── Matches ──────────────────────────────────────────────
  const addMatchResult = useCallback((match) => {
    const id = `M-${String(matchResultsList.length + 1).padStart(3, '0')}`;
    setMatchResults(prev => [...prev, { ...match, MatchID: id }]);
  }, [matchResultsList.length]);

  // ─── Email Logs ───────────────────────────────────────────
  const addEmailLog = useCallback((log) => {
    const id = `EM-${String(emailLogsList.length + 1).padStart(3, '0')}`;
    setEmailLogs(prev => [...prev, { ...log, EmailID: id, Timestamp: new Date().toISOString() }]);
  }, [emailLogsList.length]);

  // ─── Saved Jobs ───────────────────────────────────────────
  const saveJob = useCallback((userID, jobID) => {
    setSavedJobs(prev => {
      if (prev.find(s => s.UserID === userID && s.JobID === jobID)) return prev;
      return [...prev, { UserID: userID, JobID: jobID, Status: 'Saved', SavedDate: new Date().toISOString() }];
    });
  }, []);

  const updateSavedJobStatus = useCallback((userID, jobID, status) => {
    setSavedJobs(prev => prev.map(s => s.UserID === userID && s.JobID === jobID ? { ...s, Status: status } : s));
  }, []);

  const removeSavedJob = useCallback((userID, jobID) => {
    setSavedJobs(prev => prev.filter(s => !(s.UserID === userID && s.JobID === jobID)));
  }, []);

  // ─── Notifications ────────────────────────────────────────
  const addNotification = useCallback((userID, message, type = 'info') => {
    const id = `NTF-${String(Date.now()).slice(-6)}`;
    setNotifications(prev => [{ NotifID: id, UserID: userID, Message: message, Type: type, Read: false, Timestamp: new Date().toISOString() }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((notifID) => {
    setNotifications(prev => prev.map(n => n.NotifID === notifID ? { ...n, Read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback((userID) => {
    setNotifications(prev => prev.map(n => n.UserID === userID ? { ...n, Read: true } : n));
  }, []);

  // ─── Email Prefs ──────────────────────────────────────────
  const updateEmailPrefs = useCallback((userID, prefs) => {
    setEmailPrefs(prev => {
      const exists = prev.find(p => p.UserID === userID);
      if (exists) return prev.map(p => p.UserID === userID ? { ...p, ...prefs } : p);
      return [...prev, { UserID: userID, ...prefs }];
    });
  }, []);

  // ─── Admin Settings ───────────────────────────────────────
  const updateSettings = useCallback((s) => setSettings(prev => ({ ...prev, ...s })), []);

  // ─── Audit Log ────────────────────────────────────────────
  const addAuditEntry = useCallback((flowName, action, actor = 'System') => {
    const id = `LOG-${String(auditLogList.length + 1).padStart(3, '0')}`;
    setAuditLog(prev => [{ LogID: id, FlowName: flowName, Action: action, Actor: actor, Timestamp: new Date().toISOString(), Result: 'Success', Duration: '-', ErrorText: null }, ...prev]);
  }, [auditLogList.length]);

  // ─── Helpers ──────────────────────────────────────────────
  const getUserSkills = useCallback((uid) => userSkillsList.find(s => s.UserID === uid) || null, [userSkillsList]);
  const getUserMatches = useCallback((uid) => matchResultsList.filter(m => m.UserID === uid), [matchResultsList]);
  const getUserNotifications = useCallback((uid) => notificationsList.filter(n => n.UserID === uid), [notificationsList]);
  const getUserSavedJobs = useCallback((uid) => savedJobsList.filter(s => s.UserID === uid), [savedJobsList]);
  const getUserEmailPrefs = useCallback((uid) => emailPrefsList.find(p => p.UserID === uid) || { AlertFrequency: 'daily', MinMatchPercent: 60, PreferredCategories: [], OptIn: true }, [emailPrefsList]);
  const getJobByID = useCallback((jid) => liveJobs.find(j => j.JobID === jid) || null, [liveJobs]);

  const getStats = useCallback(() => {
    const activeJobs = liveJobs.filter(j => j.IsActive).length;
    const totalMatches = matchResultsList.length;
    const avgScore = totalMatches > 0 ? Math.round(matchResultsList.reduce((s, m) => s + m.OverallMatchScore, 0) / totalMatches) : 0;
    return {
      totalUsers: users.length,
      activeJobs,
      totalMatches,
      avgMatchScore: avgScore,
      emailsSent: emailLogsList.filter(e => e.DeliveryStatus === 'Sent').length,
      resumesUploaded: userSkillsList.filter(s => s.IsProfileComplete).length,
      placementRate: Math.round((savedJobsList.filter(s => s.Status === 'Offered').length / Math.max(users.length, 1)) * 100),
    };
  }, [users, liveJobs, matchResultsList, emailLogsList, userSkillsList, savedJobsList]);

  const value = {
    users, userSkillsList, liveJobs, matchResultsList, emailLogsList,
    settings, skillGapData, auditLogList, savedJobsList, notificationsList, emailPrefsList,
    currentUser,
    login, loginAsAdmin, logout, registerUser,
    updateUserSkills, addScrapedJobs, addMatchResult, addEmailLog,
    saveJob, updateSavedJobStatus, removeSavedJob,
    addNotification, markNotificationRead, markAllNotificationsRead,
    updateEmailPrefs, updateSettings, addAuditEntry,
    getUserSkills, getUserMatches, getUserNotifications, getUserSavedJobs,
    getUserEmailPrefs, getJobByID, getStats, setSkillGapData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
