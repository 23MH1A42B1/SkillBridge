// ============================================
// SkillBridge — Power Automate Email Service
// ============================================
// Triggers Power Automate flows via HTTP webhook
// Used for: sending job match emails through Outlook
//
// Setup: Create a Power Automate flow with an HTTP trigger
// that sends emails via Outlook connector.

const POWER_AUTOMATE_CONFIG = {
  // Replace with your actual Power Automate HTTP trigger URLs
  sendJobMatchEmail: 'https://prod-XX.westus.logic.azure.com:443/workflows/YOUR_FLOW_ID/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YOUR_SIG',
  sendBulkNotification: 'https://prod-XX.westus.logic.azure.com:443/workflows/YOUR_BULK_FLOW_ID/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YOUR_SIG',
  sendWelcomeEmail: 'https://prod-XX.westus.logic.azure.com:443/workflows/YOUR_WELCOME_FLOW_ID/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YOUR_SIG',
};

// Check if we're in demo mode (no real URLs configured)
function isDemoMode() {
  return POWER_AUTOMATE_CONFIG.sendJobMatchEmail.includes('YOUR_FLOW_ID');
}

// ---- Send Single Job Match Email ----
export async function sendJobMatchEmail({ to, studentName, jobTitle, company, matchScore, skills, jobUrl, platform }) {
  const payload = {
    to,
    subject: `🎯 SkillBridge: ${matchScore}% Match — ${jobTitle} at ${company}`,
    studentName,
    jobTitle,
    company,
    matchScore,
    matchedSkills: skills.matched.join(', '),
    missingSkills: skills.missing.join(', '),
    jobUrl: jobUrl || '#',
    platform: platform || 'SkillBridge Portal',
    timestamp: new Date().toISOString(),
  };

  if (isDemoMode()) {
    console.log('[PowerAutomate] DEMO — Job match email:', payload);
    return {
      success: true,
      demo: true,
      message: `Email would be sent to ${to} via Outlook`,
      payload,
    };
  }

  try {
    const res = await fetch(POWER_AUTOMATE_CONFIG.sendJobMatchEmail, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { success: res.ok, status: res.status };
  } catch (err) {
    console.error('[PowerAutomate] Email failed:', err);
    return { success: false, error: err.message };
  }
}

// ---- Send Bulk Notifications ----
export async function sendBulkJobNotifications(matches) {
  // matches: Array of { student, job, matchScore, skills }
  const payload = {
    notifications: matches.map(m => ({
      to: m.student.email,
      studentName: m.student.name,
      jobTitle: m.job.title,
      company: m.job.company || m.job.companyName,
      matchScore: m.matchScore,
      matchedSkills: m.skills.matched.join(', '),
      jobUrl: m.job.url || m.job.sourceUrl || '#',
      platform: m.job.platform || m.job.source || 'SkillBridge',
    })),
    totalCount: matches.length,
    triggeredAt: new Date().toISOString(),
  };

  if (isDemoMode()) {
    console.log(`[PowerAutomate] DEMO — Bulk notification for ${matches.length} matches:`, payload);
    return {
      success: true,
      demo: true,
      sent: matches.length,
      message: `${matches.length} emails would be sent via Outlook`,
      details: payload.notifications.map(n => ({
        to: n.to,
        job: `${n.jobTitle} at ${n.company}`,
        score: n.matchScore,
      })),
    };
  }

  try {
    const res = await fetch(POWER_AUTOMATE_CONFIG.sendBulkNotification, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { success: res.ok, sent: matches.length };
  } catch (err) {
    console.error('[PowerAutomate] Bulk notification failed:', err);
    return { success: false, error: err.message };
  }
}

// ---- Send Welcome Email ----
export async function sendWelcomeEmail({ to, name, type }) {
  const payload = {
    to,
    subject: `Welcome to SkillBridge, ${name}!`,
    name,
    type, // 'student' or 'company'
    timestamp: new Date().toISOString(),
  };

  if (isDemoMode()) {
    console.log('[PowerAutomate] DEMO — Welcome email:', payload);
    return { success: true, demo: true };
  }

  try {
    const res = await fetch(POWER_AUTOMATE_CONFIG.sendWelcomeEmail, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { success: res.ok };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Generate Email HTML Preview ----
export function generateEmailPreview({ studentName, jobTitle, company, matchScore, matchedSkills, missingSkills, jobUrl, platform }) {
  return `
    <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; background:#060a12; color:#e8f0fe; border:1px solid #1a2d45; border-radius:12px; overflow:hidden;">
      <div style="background:linear-gradient(135deg,#00d4ff,#7c3aed); padding:24px; text-align:center;">
        <h1 style="margin:0; font-size:22px; color:#000;">⚡ SkillBridge Job Match</h1>
      </div>
      <div style="padding:24px;">
        <p>Hi <strong>${studentName}</strong>,</p>
        <p>Great news! We found a <strong style="color:#10b981;">${matchScore}% match</strong> for you:</p>
        <div style="background:#0b1220; border:1px solid #1a2d45; border-radius:10px; padding:16px; margin:16px 0;">
          <h2 style="margin:0 0 4px; color:#00d4ff; font-size:18px;">${jobTitle}</h2>
          <p style="margin:0; color:#6b88aa;">${company} · via ${platform}</p>
        </div>
        <p><strong>Matched Skills:</strong> <span style="color:#10b981;">${matchedSkills.join(', ')}</span></p>
        ${missingSkills.length > 0 ? `<p><strong>Skills to Learn:</strong> <span style="color:#f59e0b;">${missingSkills.join(', ')}</span></p>` : ''}
        <a href="${jobUrl}" style="display:inline-block; background:linear-gradient(135deg,#00d4ff,#7c3aed); color:#000; font-weight:bold; padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:12px;">View Job →</a>
      </div>
      <div style="padding:16px 24px; border-top:1px solid #1a2d45; text-align:center; color:#3d5878; font-size:12px;">
        SkillBridge — AI-Based Smart Placement Portal
      </div>
    </div>
  `;
}

export { POWER_AUTOMATE_CONFIG };
