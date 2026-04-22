import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getUserProfile } from './userService';

const PA_WEBHOOK_URL = import.meta.env.VITE_PA_JOB_MATCH_URL;

export const generateJobMatchEmailHTML = (candidateName, matches) => {
  const jobCards = matches.map(m => `
    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin-bottom:16px; background:#fafafa;">
      <h3 style="margin:0 0 8px 0; color:#111827;">${m.jobTitle} at ${m.company}</h3>
      <p style="margin:0 0 12px 0; color:#6b7280;">Match Score: <strong>${m.matchScore}%</strong></p>
      <div style="background:#d1fae5; color:#065f46; padding:4px 8px; border-radius:4px; display:inline-block; font-size:12px; margin-right:8px;">
        Matched: ${m.matchedSkills?.length || 0}
      </div>
      <div style="background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:4px; display:inline-block; font-size:12px;">
        Missing: ${m.missingSkills?.length || 0}
      </div>
      <br/><br/>
      <a href="#" style="background:#4f46e5; color:white; padding:8px 16px; text-decoration:none; border-radius:6px; display:inline-block;">Apply Now</a>
    </div>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-w-lg; margin:auto; color:#374151;">
      <div style="text-align:center; padding:20px; background:#4f46e5; color:white; border-radius:8px 8px 0 0;">
        <h2 style="margin:0; color: #0d9488;">SkillBridge</h2>
        <p style="margin:4px 0 0 0;">Your Latest Job Matches</p>
      </div>
      <div style="padding:24px; border:1px solid #e5e7eb; border-top:none; border-radius:0 0 8px 8px;">
        <p>Hello ${candidateName},</p>
        <p>Based on your recent resume analysis, we found <strong>${matches.length}</strong> new roles that match your skills.</p>
        
        <div style="margin-top:24px;">
          ${jobCards}
        </div>
        
        <p style="text-align:center; margin-top:32px; font-size:12px; color:#9ca3af;">
          © ${new Date().getFullYear()} SkillBridge Inc.<br/>
          You are receiving this because you enabled Email Alerts.
        </p>
      </div>
    </div>
  `;
};

export const logEmailSent = async (userId, email, subject, jobCount, status) => {
  await addDoc(collection(db, 'emailLogs'), {
    userId,
    email,
    subject,
    jobCount,
    status,
    sentAt: new Date().toISOString()
  });
};

export const getPendingEmailAlerts = async (minScore = 60) => {
  const q = query(collection(db, 'matchResults'), where('emailSent', '==', false), where('matchScore', '>=', minScore));
  const snapshot = await getDocs(q);
  
  // Group by userId
  const grouped = {};
  snapshot.docs.forEach(d => {
    const data = d.data();
    if (!grouped[data.userId]) {
      grouped[data.userId] = { userId: data.userId, matches: [] };
    }
    grouped[data.userId].matches.push({ id: d.id, ...data });
  });

  // Fetch user profiles for these IDs
  const requests = Object.values(grouped).map(async group => {
    const profile = await getUserProfile(group.userId);
    return { ...group, profile };
  });

  return await Promise.all(requests);
};

export const sendJobMatchEmail = async (userId, userEmail, candidateName, matches) => {
  const htmlBody = generateJobMatchEmailHTML(candidateName, matches);
  const subject = `🔥 ${matches.length} New Job Matches on SkillBridge!`;

  let status = 'failed';

  try {
    if (PA_WEBHOOK_URL && !PA_WEBHOOK_URL.includes('your-function')) {
      const response = await fetch(PA_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userEmail, subject, htmlBody, candidateName, matchCount: matches.length })
      });
      if (response.ok) {
         status = 'success';
      }
    } else {
      console.log('Mock email sent successfully (webhook missing)');
      status = 'success pb-mock';
    }
  } catch (err) {
    console.error('Email send failed', err);
  }

  await logEmailSent(userId, userEmail, subject, matches.length, status);

  if (status.includes('success')) {
    const batchOps = matches.map(m => updateDoc(doc(db, 'matchResults', m.id), { emailSent: true }));
    await Promise.all(batchOps);
  }

  return { status, htmlPreview: htmlBody };
};
