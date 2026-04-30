let scrapedJobData = null;
let userProfile = null;

// Load synced profile on startup
chrome.storage.local.get(['skillbridge_profile'], (result) => {
    const syncStatus = document.getElementById('syncStatus');
    const magicFillStatus = document.getElementById('magicFillStatus');
    if (result.skillbridge_profile) {
        userProfile = result.skillbridge_profile;
        syncStatus.textContent = 'Synced: ' + userProfile.name;
        syncStatus.style.color = '#2dd4bf';
        if (magicFillStatus) {
            magicFillStatus.textContent = 'Active 🪄';
            magicFillStatus.style.color = '#2dd4bf';
        }
    } else {
        syncStatus.textContent = 'Not Synced';
        if (magicFillStatus) {
            magicFillStatus.textContent = 'Sync Required';
            magicFillStatus.style.color = '#f87171';
        }
    }
});

// Handle Analyze Job
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  document.getElementById('status').innerText = "Scraping page data...";
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('analyzeBtn').innerText = "Scraping...";
  
  chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (jobData) => {
    if (!jobData || !jobData.title) {
       document.getElementById('status').innerText = "❌ Please open a LinkedIn or Indeed job page.";
       document.getElementById('analyzeBtn').disabled = false;
       document.getElementById('analyzeBtn').innerText = "🧠 Analyze Job Fit";
       return;
    }

    scrapedJobData = jobData;
    document.getElementById('status').innerText = `Analyzing semantic fit...`;
    
    // If we have a profile, we can do real analysis. 
    // Otherwise, we show a tip to sync.
    if (!userProfile) {
        document.getElementById('status').innerHTML = "⚠️ Please <a href='#' id='syncLink' style='color:#2dd4bf'>Sync Profile</a> first.";
        document.getElementById('analyzeBtn').disabled = false;
        document.getElementById('analyzeBtn').innerText = "🧠 Analyze Job Fit";
        return;
    }

    // Real AI Semantic Matching (Simulated with local logic for speed, but using real profile data)
    const profileSkills = [...(userProfile.skills?.technical || []), ...(userProfile.skills?.tools || [])].map(s => s.toLowerCase());
    const jobText = (jobData.title + " " + jobData.description).toLowerCase();
    
    let matchCount = 0;
    profileSkills.forEach(s => { if(jobText.includes(s)) matchCount++; });
    
    const score = profileSkills.length > 0 ? Math.min(Math.round((matchCount / (profileSkills.length * 0.4)) * 100), 98) : 70;

    setTimeout(() => {
        document.getElementById('status').style.display = 'none';
        document.getElementById('analyzeBtn').style.display = 'none';
        
        document.getElementById('resultCard').style.display = 'block';
        document.getElementById('jobTitle').innerText = jobData.title;
        document.getElementById('matchScore').innerText = `${score}%`;
        
        const summary = score > 80 
            ? `Your expertise in ${profileSkills.slice(0,2).join(', ')} makes you a top-tier candidate for this role.`
            : `You have ${matchCount} matching skills. Consider highlighting your ${profileSkills[0]} projects to bridge the gap.`;
        
        document.getElementById('summary').innerText = summary;
        document.getElementById('coverLetterBtn').style.display = 'flex';
    }, 800);
  });
});

// Handle Generate Cover Letter (REAL GROQ CALL)
document.getElementById('coverLetterBtn').addEventListener('click', async () => {
    if(!scrapedJobData || !userProfile) return;

    document.getElementById('coverLetterBtn').disabled = true;
    document.getElementById('coverLetterBtn').innerText = "🧠 AI Writing...";
    document.getElementById('coverLetterBox').style.display = 'block';
    const clTextEl = document.getElementById('clText');
    clTextEl.innerText = "";

    const apiKey = userProfile.groqKey; // Key synced from web app
    if (!apiKey) {
        clTextEl.innerText = "❌ Missing Groq API Key. Please sync again from the SkillBridge dashboard.";
        return;
    }

    const prompt = `Generate a 2-paragraph cover letter for ${scrapedJobData.title} at ${scrapedJobData.company}. User skills: ${userProfile.skills?.technical?.join(', ')}. Keep it professional and punchy.`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        let i = 0;
        const typeInterval = setInterval(() => {
            clTextEl.innerText += content.charAt(i);
            i++;
            document.getElementById('coverLetterBox').scrollTop = document.getElementById('coverLetterBox').scrollHeight;
            if(i >= content.length) {
                clearInterval(typeInterval);
                document.getElementById('coverLetterBtn').innerText = "✨ Cover Letter Ready";
                document.querySelector('.blinking-cursor').style.display = 'none';
            }
        }, 10);
    } catch (err) {
        clTextEl.innerText = "❌ AI generation failed. Check your API key.";
        document.getElementById('coverLetterBtn').disabled = false;
        document.getElementById('coverLetterBtn').innerText = "✍️ Retry Generation";
    }
});

// Handle Sync Tips
document.addEventListener('click', (e) => {
    if (e.target.id === 'syncLink') {
        // Open the live dashboard for syncing
        chrome.tabs.create({ url: 'https://skill-bridge-two-zeta.vercel.app/dashboard' });
    }
});
