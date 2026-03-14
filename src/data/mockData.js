// ═══════════════════════════════════════════════════════════════
// SkillBridge — Mock Data Layer (SharePoint Schema)
// Maps to 9 SharePoint Lists/Libraries defined in the project plan
// ═══════════════════════════════════════════════════════════════

// ─── Users List ─────────────────────────────────────────────
export const users = [
  { UserID: 'USR-001', Name: 'Aarav Sharma', Email: 'aarav.sharma@university.edu', Phone: '+91 98765 43210', College: 'IIT Bombay', DesiredRole: 'Full Stack Developer', Location: 'Mumbai', Status: 'Active', RegisteredDate: '2025-11-10' },
  { UserID: 'USR-002', Name: 'Priya Patel', Email: 'priya.patel@university.edu', Phone: '+91 87654 32109', College: 'NIT Trichy', DesiredRole: 'Data Scientist', Location: 'Bengaluru', Status: 'Active', RegisteredDate: '2025-11-12' },
  { UserID: 'USR-003', Name: 'Rohan Mehta', Email: 'rohan.mehta@university.edu', Phone: '+91 76543 21098', College: 'BITS Pilani', DesiredRole: 'Backend Developer', Location: 'Hyderabad', Status: 'Active', RegisteredDate: '2025-11-15' },
  { UserID: 'USR-004', Name: 'Sneha Reddy', Email: 'sneha.reddy@university.edu', Phone: '+91 65432 10987', College: 'VIT Vellore', DesiredRole: 'Data Analyst', Location: 'Chennai', Status: 'Active', RegisteredDate: '2025-11-18' },
  { UserID: 'USR-005', Name: 'Karan Singh', Email: 'karan.singh@university.edu', Phone: '+91 54321 09876', College: 'DTU Delhi', DesiredRole: 'DevOps Engineer', Location: 'Delhi', Status: 'Active', RegisteredDate: '2025-11-20' },
  { UserID: 'USR-006', Name: 'Ananya Gupta', Email: 'ananya.gupta@university.edu', Phone: '+91 43210 98765', College: 'IIIT Hyderabad', DesiredRole: 'Frontend Developer', Location: 'Pune', Status: 'Active', RegisteredDate: '2025-12-01' },
  { UserID: 'USR-007', Name: 'Vikram Joshi', Email: 'vikram.joshi@university.edu', Phone: '+91 32109 87654', College: 'IIT Madras', DesiredRole: 'ML Engineer', Location: 'Bengaluru', Status: 'Active', RegisteredDate: '2025-12-05' },
  { UserID: 'USR-008', Name: 'Divya Nair', Email: 'divya.nair@university.edu', Phone: '+91 21098 76543', College: 'COEP Pune', DesiredRole: 'Cloud Architect', Location: 'Remote', Status: 'Active', RegisteredDate: '2025-12-10' },
];

// ─── UserSkills List ────────────────────────────────────────
export const userSkills = [
  {
    UserID: 'USR-001',
    TechnicalSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'TypeScript', 'GraphQL'],
    SoftSkills: ['Communication', 'Leadership', 'Problem Solving', 'Teamwork'],
    Tools: ['Git', 'VS Code', 'Postman', 'Docker', 'Jira', 'Figma'],
    Certifications: ['AWS Certified Developer', 'Meta React Professional'],
    Experience: [
      { title: 'Full Stack Intern', company: 'Infosys', duration: 'Jun 2024 - Dec 2024', description: 'Built microservices with Node.js and React dashboards' },
      { title: 'Web Developer', company: 'Freelance', duration: 'Jan 2024 - May 2024', description: 'Developed 5 client websites using React and Tailwind' },
    ],
    Education: [{ degree: 'B.Tech CSE', institution: 'IIT Bombay', year: '2025', percentage: '8.9 CGPA' }],
    ProfileScore: 92,
    ProfileSummary: 'Motivated full-stack developer with strong React and Node.js expertise, AWS certified, with 6 months of industry experience at Infosys.',
    SuggestedRoles: ['Full Stack Developer', 'Frontend Engineer', 'React Developer'],
    DesiredRole: 'Full Stack Developer',
    ResumeURL: '/Resumes/USR-001/resume.pdf',
    LastParsedDate: '2025-12-15T10:30:00',
    IsProfileComplete: true,
  },
  {
    UserID: 'USR-002',
    TechnicalSkills: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'SQL', 'Scikit-learn', 'NLP'],
    SoftSkills: ['Analytical Thinking', 'Research', 'Presentation', 'Critical Thinking'],
    Tools: ['Jupyter', 'VS Code', 'Git', 'Tableau', 'Google Colab'],
    Certifications: ['Google Data Analytics', 'Deep Learning Specialization'],
    Experience: [
      { title: 'Data Science Intern', company: 'TCS', duration: 'May 2024 - Nov 2024', description: 'Built NLP models for customer sentiment analysis with 89% accuracy' },
    ],
    Education: [{ degree: 'B.Tech AI & DS', institution: 'NIT Trichy', year: '2025', percentage: '9.1 CGPA' }],
    ProfileScore: 88,
    ProfileSummary: 'Data scientist with strong Python and ML skills, specializing in NLP and deep learning with hands-on TCS experience.',
    SuggestedRoles: ['Data Scientist', 'ML Engineer', 'AI Developer'],
    DesiredRole: 'Data Scientist',
    ResumeURL: '/Resumes/USR-002/resume.pdf',
    LastParsedDate: '2025-12-16T14:20:00',
    IsProfileComplete: true,
  },
  {
    UserID: 'USR-003',
    TechnicalSkills: ['Java', 'Spring Boot', 'Python', 'PostgreSQL', 'Redis', 'Kafka', 'REST APIs', 'Microservices'],
    SoftSkills: ['Problem Solving', 'System Design', 'Documentation'],
    Tools: ['IntelliJ', 'Git', 'Docker', 'Kubernetes', 'Jenkins', 'Postman'],
    Certifications: ['Oracle Java SE', 'Kubernetes CKAD'],
    Experience: [
      { title: 'Backend Developer Intern', company: 'Razorpay', duration: 'Jul 2024 - Dec 2024', description: 'Developed payment API microservices handling 10K+ TPS' },
    ],
    Education: [{ degree: 'B.E. Computer Science', institution: 'BITS Pilani', year: '2025', percentage: '8.7 CGPA' }],
    ProfileScore: 85,
    ProfileSummary: 'Backend-focused developer experienced in Java/Spring Boot microservices, Kubernetes-certified, with fintech experience at Razorpay.',
    SuggestedRoles: ['Backend Developer', 'Java Developer', 'Platform Engineer'],
    DesiredRole: 'Backend Developer',
    ResumeURL: '/Resumes/USR-003/resume.pdf',
    LastParsedDate: '2025-12-14T09:00:00',
    IsProfileComplete: true,
  },
  {
    UserID: 'USR-004',
    TechnicalSkills: ['Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'R', 'Statistics'],
    SoftSkills: ['Analytical Thinking', 'Communication', 'Detail-Oriented', 'Storytelling'],
    Tools: ['Power BI', 'Tableau', 'Excel', 'Google Sheets', 'SQL Server', 'Git'],
    Certifications: ['Google Data Analytics', 'Microsoft Power BI'],
    Experience: [
      { title: 'Data Analyst Intern', company: 'Zomato', duration: 'Aug 2024 - Dec 2024', description: 'Created dashboards tracking delivery metrics for 50+ cities' },
    ],
    Education: [{ degree: 'B.Tech IT', institution: 'VIT Vellore', year: '2025', percentage: '8.5 CGPA' }],
    ProfileScore: 78,
    ProfileSummary: 'Data analyst skilled in Power BI and SQL, with Zomato internship experience building city-level performance dashboards.',
    SuggestedRoles: ['Data Analyst', 'Business Analyst', 'BI Developer'],
    DesiredRole: 'Data Analyst',
    ResumeURL: '/Resumes/USR-004/resume.pdf',
    LastParsedDate: '2025-12-13T16:45:00',
    IsProfileComplete: true,
  },
  {
    UserID: 'USR-005',
    TechnicalSkills: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Azure', 'CI/CD', 'Python', 'Bash'],
    SoftSkills: ['Problem Solving', 'Automation Mindset', 'Collaboration'],
    Tools: ['Jenkins', 'GitHub Actions', 'Ansible', 'Prometheus', 'Grafana', 'ArgoCD'],
    Certifications: ['AWS Solutions Architect', 'CKA Kubernetes'],
    Experience: [
      { title: 'DevOps Intern', company: 'PhonePe', duration: 'Jun 2024 - Nov 2024', description: 'Automated CI/CD pipelines and managed K8s clusters for payment services' },
    ],
    Education: [{ degree: 'B.Tech CSE', institution: 'DTU Delhi', year: '2025', percentage: '8.3 CGPA' }],
    ProfileScore: 84,
    ProfileSummary: 'DevOps engineer with strong AWS/Kubernetes skills, CKA certified, with hands-on pipeline automation experience at PhonePe.',
    SuggestedRoles: ['DevOps Engineer', 'Cloud Engineer', 'SRE'],
    DesiredRole: 'DevOps Engineer',
    ResumeURL: '/Resumes/USR-005/resume.pdf',
    LastParsedDate: '2025-12-12T11:15:00',
    IsProfileComplete: true,
  },
  {
    UserID: 'USR-006',
    TechnicalSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS', 'Framer Motion'],
    SoftSkills: ['Creativity', 'UI/UX Thinking', 'Communication', 'Attention to Detail'],
    Tools: ['Figma', 'VS Code', 'Git', 'Storybook', 'Chrome DevTools'],
    Certifications: ['Meta Frontend Developer'],
    Experience: [
      { title: 'Frontend Intern', company: 'CRED', duration: 'Jul 2024 - Dec 2024', description: 'Built component library and redesigned user onboarding flow' },
    ],
    Education: [{ degree: 'B.Tech CSE', institution: 'IIIT Hyderabad', year: '2025', percentage: '9.0 CGPA' }],
    ProfileScore: 86,
    ProfileSummary: 'Frontend specialist in React/TypeScript with CRED experience, passionate about design systems and smooth user experiences.',
    SuggestedRoles: ['Frontend Developer', 'React Developer', 'UI Engineer'],
    DesiredRole: 'Frontend Developer',
    ResumeURL: '/Resumes/USR-006/resume.pdf',
    LastParsedDate: '2025-12-11T13:00:00',
    IsProfileComplete: true,
  },
  {
    UserID: 'USR-007',
    TechnicalSkills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP', 'MLOps', 'SQL', 'FastAPI'],
    SoftSkills: ['Research', 'Analytical Thinking', 'Problem Solving', 'Technical Writing'],
    Tools: ['Jupyter', 'MLflow', 'Weights & Biases', 'Docker', 'Git', 'AWS SageMaker'],
    Certifications: ['Deep Learning Specialization', 'AWS ML Specialty'],
    Experience: [
      { title: 'ML Research Intern', company: 'Google', duration: 'May 2024 - Nov 2024', description: 'Developed vision transformer model for medical imaging classification' },
    ],
    Education: [{ degree: 'M.Tech AI', institution: 'IIT Madras', year: '2025', percentage: '9.4 CGPA' }],
    ProfileScore: 95,
    ProfileSummary: 'ML engineer with Google research experience in computer vision, AWS ML certified, strong in production ML pipelines.',
    SuggestedRoles: ['ML Engineer', 'AI Researcher', 'Data Scientist'],
    DesiredRole: 'ML Engineer',
    ResumeURL: '/Resumes/USR-007/resume.pdf',
    LastParsedDate: '2025-12-10T08:30:00',
    IsProfileComplete: true,
  },
  {
    UserID: 'USR-008',
    TechnicalSkills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Serverless', 'Python', 'Networking'],
    SoftSkills: ['Architecture Design', 'Communication', 'Mentoring', 'Problem Solving'],
    Tools: ['Terraform', 'CloudFormation', 'Pulumi', 'Grafana', 'Datadog', 'Git'],
    Certifications: ['AWS Solutions Architect Professional', 'Azure Solutions Architect', 'GCP Professional Cloud Architect'],
    Experience: [
      { title: 'Cloud Engineering Intern', company: 'Accenture', duration: 'Jun 2024 - Dec 2024', description: 'Designed multi-cloud architecture for enterprise migration projects' },
    ],
    Education: [{ degree: 'B.Tech CSE', institution: 'COEP Pune', year: '2025', percentage: '8.8 CGPA' }],
    ProfileScore: 90,
    ProfileSummary: 'Cloud architect with triple cloud certifications (AWS/Azure/GCP), experienced in enterprise migration at Accenture.',
    SuggestedRoles: ['Cloud Architect', 'Platform Engineer', 'Solutions Architect'],
    DesiredRole: 'Cloud Architect',
    ResumeURL: '/Resumes/USR-008/resume.pdf',
    LastParsedDate: '2025-12-09T15:45:00',
    IsProfileComplete: true,
  },
];

// ─── LiveJobs List ──────────────────────────────────────────
export const liveJobs = [
  { JobID: 'JOB-LI-20251220-001', Title: 'Senior React Developer', Company: 'Swiggy', Location: 'Bengaluru', Source: 'LinkedIn', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'REST APIs'], PreferredSkills: ['Next.js', 'Docker', 'AWS'], Salary: '₹18-25 LPA', ExperienceRequired: '0-2 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Build and maintain web applications using React and TypeScript for Swiggys consumer platform serving 50M+ users.' },
  { JobID: 'JOB-NK-20251220-002', Title: 'Python ML Engineer', Company: 'Ola', Location: 'Bengaluru', Source: 'Naukri', WorkMode: 'Onsite', JobType: 'Full Time', RequiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'MLOps'], PreferredSkills: ['Computer Vision', 'NLP', 'AWS SageMaker'], Salary: '₹20-30 LPA', ExperienceRequired: '0-3 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Design and deploy ML models for ride prediction, pricing and demand forecasting at scale.' },
  { JobID: 'JOB-IN-20251220-003', Title: 'Backend Developer (Java)', Company: 'Razorpay', Location: 'Bengaluru', Source: 'Indeed', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'Kafka'], PreferredSkills: ['Kubernetes', 'gRPC', 'API Gateway'], Salary: '₹15-22 LPA', ExperienceRequired: '0-2 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Build high-throughput payment APIs handling millions of transactions daily.' },
  { JobID: 'JOB-GJ-20251220-004', Title: 'Data Analyst', Company: 'Zomato', Location: 'Gurugram', Source: 'Google Jobs', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['SQL', 'Python', 'Power BI', 'Excel', 'Statistics'], PreferredSkills: ['Tableau', 'R', 'A/B Testing'], Salary: '₹10-16 LPA', ExperienceRequired: 'Fresher / 0-1 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Analyze food delivery metrics across 500+ cities and build dashboards for business stakeholders.' },
  { JobID: 'JOB-SH-20251220-005', Title: 'DevOps Engineer', Company: 'PhonePe', Location: 'Bengaluru', Source: 'Shine', WorkMode: 'Onsite', JobType: 'Full Time', RequiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'], PreferredSkills: ['Python', 'Ansible', 'Prometheus'], Salary: '₹18-28 LPA', ExperienceRequired: '0-2 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Manage infrastructure and CI/CD pipelines for one of Indias largest digital payment platforms.' },
  { JobID: 'JOB-LI-20251220-006', Title: 'Frontend Engineer', Company: 'CRED', Location: 'Bengaluru', Source: 'LinkedIn', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'JavaScript'], PreferredSkills: ['Framer Motion', 'Storybook', 'GraphQL'], Salary: '₹22-32 LPA', ExperienceRequired: '0-2 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Craft beautiful, performant UI experiences for CREDs premium fintech app used by 30M+ members.' },
  { JobID: 'JOB-NK-20251220-007', Title: 'Cloud Solutions Architect', Company: 'Accenture', Location: 'Remote', Source: 'Naukri', WorkMode: 'Remote', JobType: 'Full Time', RequiredSkills: ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'Networking'], PreferredSkills: ['GCP', 'Serverless', 'CloudFormation'], Salary: '₹25-40 LPA', ExperienceRequired: '1-3 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Design and implement cloud migration strategies for Fortune 500 clients across multi-cloud environments.' },
  { JobID: 'JOB-GJ-20251220-008', Title: 'AI Research Engineer', Company: 'Google India', Location: 'Bengaluru', Source: 'Google Jobs', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP', 'MLOps'], PreferredSkills: ['JAX', 'TPU', 'Research Papers'], Salary: '₹35-55 LPA', ExperienceRequired: '0-2 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Conduct cutting-edge research in AI/ML and publish findings. Work on large-scale models for Google services.' },
  { JobID: 'JOB-LI-20251220-009', Title: 'MERN Stack Developer', Company: 'Paytm', Location: 'Noida', Source: 'LinkedIn', WorkMode: 'Onsite', JobType: 'Full Time', RequiredSkills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'REST APIs'], PreferredSkills: ['TypeScript', 'Redis', 'AWS'], Salary: '₹12-18 LPA', ExperienceRequired: 'Fresher / 0-1 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Build consumer-facing features for Paytms merchant and wallet platforms using the MERN stack.' },
  { JobID: 'JOB-NK-20251220-010', Title: 'Power Platform Consultant', Company: 'TCS Digital', Location: 'Mumbai', Source: 'Naukri', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['Power Apps', 'Power Automate', 'SharePoint', 'Power BI', 'SQL'], PreferredSkills: ['Azure', 'JavaScript', 'Dataverse'], Salary: '₹10-15 LPA', ExperienceRequired: 'Fresher / 0-1 years', ApplyURL: '#', ScrapedAt: '2025-12-20T06:00:00', IsActive: true, JobDescription: 'Implement Microsoft Power Platform solutions for enterprise clients including workflow automation.' },
  { JobID: 'JOB-IN-20251220-011', Title: 'Data Science Intern', Company: 'Flipkart', Location: 'Bengaluru', Source: 'Indeed', WorkMode: 'Hybrid', JobType: 'Internship', RequiredSkills: ['Python', 'Pandas', 'SQL', 'Scikit-learn', 'Statistics'], PreferredSkills: ['TensorFlow', 'Spark', 'NLP'], Salary: '₹40K/month', ExperienceRequired: 'Fresher', ApplyURL: '#', ScrapedAt: '2025-12-20T12:00:00', IsActive: true, JobDescription: 'Work on recommendation engine improvements and customer analytics for Flipkarts e-commerce platform.' },
  { JobID: 'JOB-GL-20251220-012', Title: 'SRE / Infrastructure Engineer', Company: 'Meesho', Location: 'Bengaluru', Source: 'Glassdoor', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Python', 'Monitoring'], PreferredSkills: ['Terraform', 'Go', 'Istio'], Salary: '₹16-24 LPA', ExperienceRequired: '0-2 years', ApplyURL: '#', ScrapedAt: '2025-12-20T12:00:00', IsActive: true, JobDescription: 'Ensure 99.99% uptime for Meeshos social commerce platform serving 150M+ transacting users.' },
  { JobID: 'JOB-LI-20251220-013', Title: 'Full Stack Intern', Company: 'Zerodha', Location: 'Bengaluru', Source: 'LinkedIn', WorkMode: 'Onsite', JobType: 'Internship', RequiredSkills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'], PreferredSkills: ['Go', 'Redis', 'WebSockets'], Salary: '₹50K/month', ExperienceRequired: 'Fresher', ApplyURL: '#', ScrapedAt: '2025-12-20T12:00:00', IsActive: true, JobDescription: 'Build trading tools and internal dashboards for Indias largest stockbroking platform.' },
  { JobID: 'JOB-NK-20251220-014', Title: 'NLP Engineer', Company: 'Myntra', Location: 'Bengaluru', Source: 'Naukri', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['Python', 'NLP', 'TensorFlow', 'Transformers', 'SQL'], PreferredSkills: ['PyTorch', 'FastAPI', 'Docker'], Salary: '₹18-26 LPA', ExperienceRequired: '0-2 years', ApplyURL: '#', ScrapedAt: '2025-12-20T12:00:00', IsActive: true, JobDescription: 'Build NLP models for fashion search, product descriptions, and chatbot intelligence.' },
  { JobID: 'JOB-SH-20251220-015', Title: 'Business Intelligence Analyst', Company: 'Dream11', Location: 'Mumbai', Source: 'Shine', WorkMode: 'Hybrid', JobType: 'Full Time', RequiredSkills: ['SQL', 'Power BI', 'Python', 'Excel', 'Statistics'], PreferredSkills: ['Tableau', 'Looker', 'A/B Testing'], Salary: '₹12-20 LPA', ExperienceRequired: 'Fresher / 0-1 years', ApplyURL: '#', ScrapedAt: '2025-12-20T12:00:00', IsActive: true, JobDescription: 'Generate insights from gaming data to optimize user engagement and revenue for fantasy sports platform.' },
];

// ─── MatchResults List ──────────────────────────────────────
export const matchResults = [
  // USR-001 (Aarav — Full Stack)
  { MatchID: 'M-001', UserID: 'USR-001', JobID: 'JOB-LI-20251220-001', OverallMatchScore: 88, Verdict: 'STRONG MATCH', MatchedSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'REST APIs'], MissingSkills: [], BonusSkills: ['Express', 'MongoDB', 'Docker'], CategoryScores: { technical: 92, soft: 80, tools: 85, domain: 90 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-002', UserID: 'USR-001', JobID: 'JOB-LI-20251220-009', OverallMatchScore: 95, Verdict: 'STRONG MATCH', MatchedSkills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'REST APIs'], MissingSkills: [], BonusSkills: ['TypeScript', 'GraphQL'], CategoryScores: { technical: 98, soft: 85, tools: 90, domain: 95 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-003', UserID: 'USR-001', JobID: 'JOB-LI-20251220-013', OverallMatchScore: 82, Verdict: 'STRONG MATCH', MatchedSkills: ['React', 'Node.js', 'REST APIs', 'Git'], MissingSkills: ['PostgreSQL'], BonusSkills: ['TypeScript', 'MongoDB'], CategoryScores: { technical: 85, soft: 78, tools: 80, domain: 82 }, IsRecommended: true, EmailSent: false, EmailSentDate: null },

  // USR-002 (Priya — Data Science)
  { MatchID: 'M-004', UserID: 'USR-002', JobID: 'JOB-NK-20251220-002', OverallMatchScore: 90, Verdict: 'STRONG MATCH', MatchedSkills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'MLOps'], MissingSkills: [], BonusSkills: ['NLP', 'Scikit-learn'], CategoryScores: { technical: 95, soft: 82, tools: 78, domain: 92 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-005', UserID: 'USR-002', JobID: 'JOB-IN-20251220-011', OverallMatchScore: 85, Verdict: 'STRONG MATCH', MatchedSkills: ['Python', 'Pandas', 'SQL', 'Scikit-learn'], MissingSkills: ['Statistics'], BonusSkills: ['TensorFlow', 'NLP'], CategoryScores: { technical: 88, soft: 80, tools: 75, domain: 85 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-006', UserID: 'USR-002', JobID: 'JOB-NK-20251220-014', OverallMatchScore: 78, Verdict: 'GOOD MATCH', MatchedSkills: ['Python', 'NLP', 'TensorFlow'], MissingSkills: ['Transformers'], BonusSkills: ['PyTorch'], CategoryScores: { technical: 80, soft: 75, tools: 70, domain: 80 }, IsRecommended: true, EmailSent: false, EmailSentDate: null },

  // USR-003 (Rohan — Backend)
  { MatchID: 'M-007', UserID: 'USR-003', JobID: 'JOB-IN-20251220-003', OverallMatchScore: 94, Verdict: 'STRONG MATCH', MatchedSkills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'Kafka'], MissingSkills: [], BonusSkills: ['Kubernetes', 'Docker'], CategoryScores: { technical: 96, soft: 85, tools: 90, domain: 95 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },

  // USR-004 (Sneha — Data Analyst)
  { MatchID: 'M-008', UserID: 'USR-004', JobID: 'JOB-GJ-20251220-004', OverallMatchScore: 86, Verdict: 'STRONG MATCH', MatchedSkills: ['SQL', 'Python', 'Power BI', 'Excel', 'Statistics'], MissingSkills: [], BonusSkills: ['Tableau', 'R'], CategoryScores: { technical: 90, soft: 82, tools: 88, domain: 85 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-009', UserID: 'USR-004', JobID: 'JOB-SH-20251220-015', OverallMatchScore: 82, Verdict: 'STRONG MATCH', MatchedSkills: ['SQL', 'Power BI', 'Python', 'Excel', 'Statistics'], MissingSkills: [], BonusSkills: ['Tableau'], CategoryScores: { technical: 85, soft: 80, tools: 84, domain: 80 }, IsRecommended: true, EmailSent: false, EmailSentDate: null },

  // USR-005 (Karan — DevOps)
  { MatchID: 'M-010', UserID: 'USR-005', JobID: 'JOB-SH-20251220-005', OverallMatchScore: 92, Verdict: 'STRONG MATCH', MatchedSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'], MissingSkills: [], BonusSkills: ['Python', 'Ansible', 'Prometheus'], CategoryScores: { technical: 95, soft: 80, tools: 92, domain: 90 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-011', UserID: 'USR-005', JobID: 'JOB-GL-20251220-012', OverallMatchScore: 80, Verdict: 'STRONG MATCH', MatchedSkills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Python'], MissingSkills: ['Monitoring'], BonusSkills: ['Terraform'], CategoryScores: { technical: 82, soft: 75, tools: 85, domain: 78 }, IsRecommended: true, EmailSent: false, EmailSentDate: null },

  // USR-006 (Ananya — Frontend)
  { MatchID: 'M-012', UserID: 'USR-006', JobID: 'JOB-LI-20251220-006', OverallMatchScore: 96, Verdict: 'STRONG MATCH', MatchedSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'JavaScript'], MissingSkills: [], BonusSkills: ['Framer Motion', 'Storybook'], CategoryScores: { technical: 98, soft: 90, tools: 92, domain: 96 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-013', UserID: 'USR-006', JobID: 'JOB-LI-20251220-001', OverallMatchScore: 75, Verdict: 'GOOD MATCH', MatchedSkills: ['React', 'TypeScript', 'JavaScript'], MissingSkills: ['Node.js', 'GraphQL'], BonusSkills: ['Next.js', 'Tailwind CSS'], CategoryScores: { technical: 78, soft: 82, tools: 70, domain: 72 }, IsRecommended: true, EmailSent: false, EmailSentDate: null },

  // USR-007 (Vikram — ML)
  { MatchID: 'M-014', UserID: 'USR-007', JobID: 'JOB-GJ-20251220-008', OverallMatchScore: 93, Verdict: 'STRONG MATCH', MatchedSkills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP', 'MLOps'], MissingSkills: [], BonusSkills: ['FastAPI', 'SQL'], CategoryScores: { technical: 96, soft: 85, tools: 88, domain: 95 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
  { MatchID: 'M-015', UserID: 'USR-007', JobID: 'JOB-NK-20251220-002', OverallMatchScore: 87, Verdict: 'STRONG MATCH', MatchedSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'], MissingSkills: ['SQL'], BonusSkills: ['Computer Vision', 'NLP'], CategoryScores: { technical: 90, soft: 80, tools: 82, domain: 88 }, IsRecommended: true, EmailSent: false, EmailSentDate: null },

  // USR-008 (Divya — Cloud)
  { MatchID: 'M-016', UserID: 'USR-008', JobID: 'JOB-NK-20251220-007', OverallMatchScore: 91, Verdict: 'STRONG MATCH', MatchedSkills: ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'Networking'], MissingSkills: [], BonusSkills: ['GCP', 'Serverless', 'CloudFormation'], CategoryScores: { technical: 94, soft: 85, tools: 92, domain: 90 }, IsRecommended: true, EmailSent: true, EmailSentDate: '2025-12-20T08:30:00' },
];

// ─── EmailLogs List ─────────────────────────────────────────
export const emailLogs = [
  { EmailID: 'EM-001', UserID: 'USR-001', RecipientEmail: 'aarav.sharma@university.edu', JobsIncluded: ['JOB-LI-20251220-001', 'JOB-LI-20251220-009'], Subject: '2 New High-Match Jobs Found for You!', Timestamp: '2025-12-20T08:30:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
  { EmailID: 'EM-002', UserID: 'USR-002', RecipientEmail: 'priya.patel@university.edu', JobsIncluded: ['JOB-NK-20251220-002', 'JOB-IN-20251220-011'], Subject: '2 Data Science Jobs Match Your Profile!', Timestamp: '2025-12-20T08:31:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
  { EmailID: 'EM-003', UserID: 'USR-003', RecipientEmail: 'rohan.mehta@university.edu', JobsIncluded: ['JOB-IN-20251220-003'], Subject: '1 Strong Backend Match at Razorpay!', Timestamp: '2025-12-20T08:31:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
  { EmailID: 'EM-004', UserID: 'USR-004', RecipientEmail: 'sneha.reddy@university.edu', JobsIncluded: ['JOB-GJ-20251220-004'], Subject: 'Data Analyst Role at Zomato — 86% Match!', Timestamp: '2025-12-20T08:32:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
  { EmailID: 'EM-005', UserID: 'USR-005', RecipientEmail: 'karan.singh@university.edu', JobsIncluded: ['JOB-SH-20251220-005'], Subject: 'DevOps Engineer at PhonePe — 92% Match!', Timestamp: '2025-12-20T08:32:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
  { EmailID: 'EM-006', UserID: 'USR-006', RecipientEmail: 'ananya.gupta@university.edu', JobsIncluded: ['JOB-LI-20251220-006'], Subject: 'Perfect Frontend Match at CRED — 96%!', Timestamp: '2025-12-20T08:33:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
  { EmailID: 'EM-007', UserID: 'USR-007', RecipientEmail: 'vikram.joshi@university.edu', JobsIncluded: ['JOB-GJ-20251220-008'], Subject: 'AI Research Engineer at Google — 93%!', Timestamp: '2025-12-20T08:33:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
  { EmailID: 'EM-008', UserID: 'USR-008', RecipientEmail: 'divya.nair@university.edu', JobsIncluded: ['JOB-NK-20251220-007'], Subject: 'Cloud Architect at Accenture — 91% Match!', Timestamp: '2025-12-20T08:34:00', Template: 'job-alert-v1', DeliveryStatus: 'Sent' },
];

// ─── AdminSettings List ─────────────────────────────────────
export const adminSettings = {
  ScrapeInterval: 6,        // hours
  MinMatchPercent: 60,
  EmailFrequency: 'daily',  // daily | weekly | instant
  EnabledPortals: ['LinkedIn', 'Naukri', 'Indeed', 'Google Jobs', 'Shine', 'Glassdoor'],
  APIReferences: { claudeAPI: '***configured***', serpAPI: '***configured***' },
  AdminEmailList: ['admin@skillbridge.edu'],
  PortalEnabled: true,
};

// ─── SkillGapReport List ────────────────────────────────────
export const skillGapReport = [
  { SkillName: 'React', DemandCount: 42, GapCount: 8, TrendWeek: 'Week 51' },
  { SkillName: 'Python', DemandCount: 58, GapCount: 5, TrendWeek: 'Week 51' },
  { SkillName: 'TypeScript', DemandCount: 38, GapCount: 15, TrendWeek: 'Week 51' },
  { SkillName: 'AWS', DemandCount: 35, GapCount: 12, TrendWeek: 'Week 51' },
  { SkillName: 'Docker', DemandCount: 32, GapCount: 10, TrendWeek: 'Week 51' },
  { SkillName: 'Kubernetes', DemandCount: 28, GapCount: 14, TrendWeek: 'Week 51' },
  { SkillName: 'SQL', DemandCount: 45, GapCount: 6, TrendWeek: 'Week 51' },
  { SkillName: 'Node.js', DemandCount: 30, GapCount: 9, TrendWeek: 'Week 51' },
  { SkillName: 'TensorFlow', DemandCount: 22, GapCount: 11, TrendWeek: 'Week 51' },
  { SkillName: 'Power BI', DemandCount: 18, GapCount: 13, TrendWeek: 'Week 51' },
  { SkillName: 'Java', DemandCount: 25, GapCount: 7, TrendWeek: 'Week 51' },
  { SkillName: 'GraphQL', DemandCount: 15, GapCount: 16, TrendWeek: 'Week 51' },
  { SkillName: 'MLOps', DemandCount: 20, GapCount: 18, TrendWeek: 'Week 51' },
  { SkillName: 'Terraform', DemandCount: 17, GapCount: 14, TrendWeek: 'Week 51' },
  { SkillName: 'NLP', DemandCount: 19, GapCount: 12, TrendWeek: 'Week 51' },
];

// ─── AuditLog List ──────────────────────────────────────────
export const auditLog = [
  { LogID: 'LOG-001', FlowName: 'F2-JobScraper', Action: 'Scrape All Portals', Actor: 'System', Timestamp: '2025-12-20T06:00:00', Result: 'Success', Duration: '4m 32s', ErrorText: null },
  { LogID: 'LOG-002', FlowName: 'F3-SkillMatcher', Action: 'Match 8 users × 15 jobs', Actor: 'System', Timestamp: '2025-12-20T06:05:00', Result: 'Success', Duration: '2m 18s', ErrorText: null },
  { LogID: 'LOG-003', FlowName: 'F4-EmailDispatcher', Action: 'Send 8 emails', Actor: 'System', Timestamp: '2025-12-20T08:30:00', Result: 'Success', Duration: '1m 45s', ErrorText: null },
  { LogID: 'LOG-004', FlowName: 'F5-PowerBIRefresh', Action: 'Refresh all datasets', Actor: 'System', Timestamp: '2025-12-20T08:35:00', Result: 'Success', Duration: '3m 10s', ErrorText: null },
  { LogID: 'LOG-005', FlowName: 'F1-ResumeParse', Action: 'Parse resume USR-008', Actor: 'USR-008', Timestamp: '2025-12-19T15:45:00', Result: 'Success', Duration: '8s', ErrorText: null },
  { LogID: 'LOG-006', FlowName: 'F1-ResumeParse', Action: 'Parse resume USR-007', Actor: 'USR-007', Timestamp: '2025-12-19T08:30:00', Result: 'Success', Duration: '7s', ErrorText: null },
  { LogID: 'LOG-007', FlowName: 'F2-JobScraper', Action: 'Scrape All Portals', Actor: 'System', Timestamp: '2025-12-20T00:00:00', Result: 'Success', Duration: '5m 01s', ErrorText: null },
  { LogID: 'LOG-008', FlowName: 'F6-DailyReport', Action: 'Generate admin summary', Actor: 'System', Timestamp: '2025-12-20T08:00:00', Result: 'Success', Duration: '12s', ErrorText: null },
  { LogID: 'LOG-009', FlowName: 'F1-ResumeParse', Action: 'Parse resume USR-006', Actor: 'USR-006', Timestamp: '2025-12-18T13:00:00', Result: 'Success', Duration: '9s', ErrorText: null },
  { LogID: 'LOG-010', FlowName: 'F2-JobScraper', Action: 'Scrape LinkedIn', Actor: 'System', Timestamp: '2025-12-19T18:00:00', Result: 'Failed', Duration: '1m 05s', ErrorText: 'Rate limit exceeded — retrying in 30s' },
  { LogID: 'LOG-011', FlowName: 'F3-SkillMatcher', Action: 'Match 8 users × 10 jobs', Actor: 'System', Timestamp: '2025-12-20T00:08:00', Result: 'Success', Duration: '1m 52s', ErrorText: null },
  { LogID: 'LOG-012', FlowName: 'F4-EmailDispatcher', Action: 'Send 6 emails', Actor: 'System', Timestamp: '2025-12-19T18:30:00', Result: 'Success', Duration: '1m 20s', ErrorText: null },
];

// ─── User Saved Jobs (local state) ─────────────────────────
export const savedJobs = [
  { UserID: 'USR-001', JobID: 'JOB-LI-20251220-001', Status: 'Applied', SavedDate: '2025-12-20T09:00:00' },
  { UserID: 'USR-001', JobID: 'JOB-LI-20251220-009', Status: 'Saved', SavedDate: '2025-12-20T09:05:00' },
  { UserID: 'USR-002', JobID: 'JOB-NK-20251220-002', Status: 'Interviewing', SavedDate: '2025-12-20T09:10:00' },
  { UserID: 'USR-006', JobID: 'JOB-LI-20251220-006', Status: 'Applied', SavedDate: '2025-12-20T09:15:00' },
  { UserID: 'USR-007', JobID: 'JOB-GJ-20251220-008', Status: 'Offered', SavedDate: '2025-12-20T09:20:00' },
];

// ─── User Notifications ─────────────────────────────────────
export const notifications = [
  { NotifID: 'NTF-001', UserID: 'USR-001', Message: '2 new jobs matched your profile! Check your email.', Type: 'match', Read: false, Timestamp: '2025-12-20T08:30:00' },
  { NotifID: 'NTF-002', UserID: 'USR-001', Message: 'Your resume has been parsed. 8 skills extracted.', Type: 'resume', Read: true, Timestamp: '2025-12-15T10:30:00' },
  { NotifID: 'NTF-003', UserID: 'USR-002', Message: 'Python ML Engineer at Ola — 90% match!', Type: 'match', Read: false, Timestamp: '2025-12-20T08:31:00' },
  { NotifID: 'NTF-004', UserID: 'USR-006', Message: 'Frontend Engineer at CRED — 96% match!', Type: 'match', Read: false, Timestamp: '2025-12-20T08:33:00' },
  { NotifID: 'NTF-005', UserID: 'USR-007', Message: 'AI Research Engineer at Google — 93% match!', Type: 'match', Read: false, Timestamp: '2025-12-20T08:33:00' },
  { NotifID: 'NTF-006', UserID: 'USR-003', Message: 'Backend Developer at Razorpay — 94% match!', Type: 'match', Read: true, Timestamp: '2025-12-20T08:31:00' },
  { NotifID: 'NTF-007', UserID: 'USR-005', Message: 'DevOps Engineer at PhonePe — 92% match!', Type: 'match', Read: false, Timestamp: '2025-12-20T08:32:00' },
  { NotifID: 'NTF-008', UserID: 'USR-008', Message: 'Cloud Architect at Accenture — 91% match!', Type: 'match', Read: true, Timestamp: '2025-12-20T08:34:00' },
  { NotifID: 'NTF-009', UserID: 'USR-004', Message: 'New skill gap report available. 3 priority skills to learn.', Type: 'skillgap', Read: false, Timestamp: '2025-12-20T09:00:00' },
];

// ─── User Email Preferences ─────────────────────────────────
export const emailPreferences = [
  { UserID: 'USR-001', AlertFrequency: 'daily', MinMatchPercent: 70, PreferredCategories: ['Full Stack', 'Frontend', 'React'], OptIn: true },
  { UserID: 'USR-002', AlertFrequency: 'daily', MinMatchPercent: 65, PreferredCategories: ['Data Science', 'ML', 'AI'], OptIn: true },
  { UserID: 'USR-003', AlertFrequency: 'instant', MinMatchPercent: 75, PreferredCategories: ['Backend', 'Java', 'Microservices'], OptIn: true },
  { UserID: 'USR-004', AlertFrequency: 'weekly', MinMatchPercent: 60, PreferredCategories: ['Data Analyst', 'BI', 'Analytics'], OptIn: true },
  { UserID: 'USR-005', AlertFrequency: 'daily', MinMatchPercent: 70, PreferredCategories: ['DevOps', 'Cloud', 'SRE'], OptIn: true },
  { UserID: 'USR-006', AlertFrequency: 'instant', MinMatchPercent: 80, PreferredCategories: ['Frontend', 'React', 'UI'], OptIn: true },
  { UserID: 'USR-007', AlertFrequency: 'daily', MinMatchPercent: 70, PreferredCategories: ['ML Engineer', 'AI Research', 'NLP'], OptIn: true },
  { UserID: 'USR-008', AlertFrequency: 'weekly', MinMatchPercent: 65, PreferredCategories: ['Cloud', 'DevOps', 'Architecture'], OptIn: true },
];
