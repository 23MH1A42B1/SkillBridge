import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const COL_APPS = 'applications';

export const STAGES = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'offered', title: 'Offered', color: 'bg-green-500/10 text-green-400' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500/10 text-red-400' }
];

export const addApplication = async (userId, jobData) => {
  const docRef = await addDoc(collection(db, COL_APPS), {
    userId,
    jobId: jobData.id || jobData.jobId || 'ext_' + Date.now(),
    jobTitle: jobData.jobTitle || jobData.title,
    company: jobData.company,
    location: jobData.location || 'Remote',
    salary: jobData.salary || '',
    stage: 'applied',
    source: jobData.source || 'Manual',
    link: jobData.jobUrl || jobData.url || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
};

export const getApplications = async (userId) => {
  const q = query(collection(db, COL_APPS), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateApplicationStage = async (appId, newStage) => {
  const docRef = doc(db, COL_APPS, appId);
  await updateDoc(docRef, { 
    stage: newStage,
    updatedAt: new Date().toISOString()
  });
};

export const deleteApplication = async (appId) => {
  await deleteDoc(doc(db, COL_APPS, appId));
};
