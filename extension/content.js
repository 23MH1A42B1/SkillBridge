// SkillBridge Magic Fill Content Script
console.log('SkillBridge Magic Fill Active 🪄');

const FIELD_MAPPING = {
  'name': ['name', 'full name', 'fullname', 'first_name', 'last_name'],
  'email': ['email', 'email address', 'e-mail'],
  'phone': ['phone', 'mobile', 'telephone', 'cell'],
  'linkedin': ['linkedin', 'profile url', 'linkedin url'],
  'github': ['github', 'portfolio'],
  'experience': ['experience', 'years of experience', 'seniority'],
  'skills': ['skills', 'keywords', 'tech stack'],
  'summary': ['summary', 'cover letter', 'intro']
};

/**
 * Identify the type of an input based on labels, placeholders, and names.
 */
function identifyField(input) {
  const identifier = (
    input.name + ' ' + 
    input.id + ' ' + 
    input.placeholder + ' ' + 
    (input.labels?.[0]?.innerText || '')
  ).toLowerCase();

  for (const [key, patterns] of Object.entries(FIELD_MAPPING)) {
    if (patterns.some(p => identifier.includes(p))) return key;
  }
  return null;
}

/**
 * Fill a single field with data
 */
function fillField(input, type, profile) {
  if (!profile) return;

  let value = '';
  switch (type) {
    case 'name': value = profile.fullName; break;
    case 'email': value = profile.email; break;
    case 'phone': value = profile.phone || ''; break;
    case 'linkedin': value = profile.linkedin || ''; break;
    case 'github': value = profile.github || ''; break;
    case 'experience': value = profile.experience || '3 years'; break;
    case 'skills': value = (profile.skills?.technical || []).join(', '); break;
    case 'summary': value = profile.summary || ''; break;
  }

  if (value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`Filled ${type} with: ${value}`);
  }
}

/**
 * Scan the page and show the Magic Fill button
 */
function injectMagicFill() {
  const forms = document.querySelectorAll('form');
  if (forms.length === 0) return;

  // Check if we already injected
  if (document.getElementById('sb-magic-fill-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'sb-magic-fill-btn';
  btn.innerHTML = '🪄 Magic Fill';
  btn.className = 'skillbridge-magic-btn';
  
  btn.onclick = async () => {
    btn.innerHTML = '⏳ Filling...';
    
    chrome.storage.local.get(['skillbridge_profile'], (result) => {
      const profile = result.skillbridge_profile;
      if (!profile) {
        alert('Please sync your SkillBridge profile first!');
        btn.innerHTML = '🪄 Magic Fill';
        return;
      }

      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const type = identifyField(input);
        if (type) {
          fillField(input, type, profile);
        }
      });

      btn.innerHTML = '✅ Done!';
      setTimeout(() => btn.innerHTML = '🪄 Magic Fill', 2000);
    });
  };

  document.body.appendChild(btn);
}

// Listen for sync events from the dashboard
window.addEventListener('SkillBridgeSyncEvent', (event) => {
  const { type, payload } = event.detail;
  if (type === 'SKILLBRIDGE_SYNC') {
    chrome.storage.local.set({ skillbridge_profile: payload }, () => {
      console.log('✅ SkillBridge Profile Synced Successfully!');
    });
  }
});

// Watch for DOM changes (common on SPA job boards)
const observer = new MutationObserver(() => {
  // Only inject on job boards, not on the dashboard itself
  const isJobBoard = /linkedin|indeed|glassdoor|greenhouse|lever/.test(window.location.hostname);
  if (isJobBoard) {
    injectMagicFill();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
if (/linkedin|indeed|glassdoor|greenhouse|lever/.test(window.location.hostname)) {
  injectMagicFill();
}
