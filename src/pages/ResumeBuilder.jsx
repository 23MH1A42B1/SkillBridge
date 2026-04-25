import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { marked } from 'marked';
import { useToast } from '../context/ToastContext';

// Default resume template
const defaultMarkdown = `
# John Doe
**Software Engineer** | john.doe@example.com | (555) 123-4567 | github.com/johndoe

## Summary
Passionate Software Engineer with 5+ years of experience in building scalable web applications. Proficient in React, Node.js, and Python.

## Experience

### Senior Developer - Tech Innovations Inc.
*Jan 2020 - Present*
* Architected a microservices backend using Node.js and Docker, improving system uptime by 99.9%.
* Led a team of 4 frontend engineers to rebuild the core React application.
* Optimized database queries, reducing load times by 40%.

### Web Developer - WebSolutions
*Jun 2017 - Dec 2019*
* Developed interactive user interfaces using vanilla JavaScript and CSS.
* Implemented responsive designs for mobile compatibility.

## Education
**B.S. in Computer Science**  
University of Technology | 2013 - 2017

## Skills
React, Node.js, Python, AWS, Docker, Kubernetes, SQL, NoSQL
`;

export default function ResumeBuilder() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [html, setHtml] = useState('');
  const [skills, setSkills] = useState([]);
  const [mlStatus, setMlStatus] = useState('Initializing AI...');
  const worker = useRef(null);
  const typingTimer = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Parse Markdown to HTML
    setHtml(marked.parse(markdown));

    // Handle ML Skill Extraction typing debounce
    if (worker.current && mlStatus !== 'Initializing AI...') {
        setMlStatus('Typing...');
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            setMlStatus('Extracting Entities...');
            worker.current.postMessage({ type: 'extract_skills', text: markdown });
        }, 2000); // Wait 2s after typing stops before running heavy NER
    }
  }, [markdown]);

  useEffect(() => {
    // Initialize Web Worker for ML
    worker.current = new Worker(new URL('../services/mlWorker.js', import.meta.url), { type: 'module' });

    worker.current.onmessage = (e) => {
        if (e.data.status === 'progress') {
            if (e.data.progress && e.data.progress.progress) {
                setMlStatus(`Downloading NER Model (${Math.round(e.data.progress.progress)}%)`);
            }
        } else if (e.data.status === 'ready') {
            setMlStatus('AI Ready');
            // Run initial extraction
            worker.current.postMessage({ type: 'extract_skills', text: defaultMarkdown });
        } else if (e.data.status === 'complete') {
            setSkills(e.data.result || []);
            setMlStatus('AI Ready');
        } else if (e.data.status === 'error') {
            console.error("ML Error:", e.data.error);
            setMlStatus('AI Offline');
        }
    };

    worker.current.postMessage({ type: 'init_ner' });

    return () => {
        worker.current.terminate();
        clearTimeout(typingTimer.current);
    };
  }, []);

  const handlePrint = () => {
    showToast('Preparing PDF download...', 'info');
    setTimeout(() => {
        window.print();
    }, 500);
  };

  return (
    <AppLayout>
      {/* Hide everything except the preview when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Custom PDF styles */
          #resume-preview h1 { color: #111827 !important; margin-bottom: 4px !important; }
          #resume-preview h2 { color: #374151 !important; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-top: 16px; margin-bottom: 8px; }
          #resume-preview p, #resume-preview li { color: #4b5563 !important; line-height: 1.5; font-size: 11pt; }
        }
        
        /* Preview styling for screen */
        .prose-resume h1 { font-size: 2.25rem; font-weight: 900; color: #111827; margin-bottom: 0.5rem; text-align: center; }
        .prose-resume h2 { font-size: 1.25rem; font-weight: 800; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .prose-resume h3 { font-size: 1.1rem; font-weight: 700; color: #111827; margin-top: 1rem; margin-bottom: 0.25rem; }
        .prose-resume p { color: #4b5563; margin-bottom: 0.5rem; line-height: 1.6; }
        .prose-resume ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose-resume li { color: #4b5563; margin-bottom: 0.25rem; line-height: 1.6; }
        .prose-resume strong { font-weight: 700; color: #111827; }
        .prose-resume em { font-style: italic; color: #6b7280; }
      `}</style>

      <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-end mb-6 shrink-0 print:hidden">
           <div>
             <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
               ✍️ Live AI Resume Builder
             </h1>
             <p className="text-gray-500 font-medium mt-1">Write in Markdown. Extract skills locally. Print to PDF.</p>
           </div>
           <button onClick={handlePrint} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm shadow-neon-glow flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Download PDF
           </button>
        </header>

        {/* AI Skill Extraction Status Bar */}
        <div className="bg-dark-card border border-white/5 rounded-xl p-4 mb-6 shrink-0 flex items-center gap-4 print:hidden">
           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-400 shrink-0">
             <span className={`w-2 h-2 rounded-full ${mlStatus === 'AI Ready' ? 'bg-green-400' : 'bg-brand-400 animate-pulse'}`} />
             {mlStatus}
           </div>
           <div className="h-4 w-px bg-white/10" />
           <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar flex-1 items-center">
             <span className="text-xs text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">Extracted Entities:</span>
             {skills.length === 0 ? (
                <span className="text-xs text-gray-600 font-medium italic">Type to extract skills...</span>
             ) : (
                skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-lg text-xs font-black whitespace-nowrap">
                    {skill}
                  </span>
                ))
             )}
           </div>
        </div>

        {/* Split Pane */}
        <div className="flex gap-6 flex-1 min-h-0 print:hidden">
          
          {/* Editor Pane */}
          <div className="flex-1 flex flex-col bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gray-700 to-gray-500 opacity-50"></div>
            <div className="p-3 bg-white/5 border-b border-white/5 text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="ml-2">Markdown Editor</span>
            </div>
            <textarea
              className="flex-1 w-full p-6 bg-transparent text-gray-300 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 border-none custom-scrollbar"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck="false"
            />
          </div>

          {/* Preview Pane */}
          <div className="flex-1 flex flex-col relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-t-xl z-10"></div>
            <div className="flex-1 bg-gray-100 rounded-2xl overflow-y-auto custom-scrollbar p-8 shadow-2xl relative">
               {/* This is the printable area */}
               <div 
                 id="resume-preview" 
                 className="bg-white mx-auto shadow-sm p-12 min-h-full max-w-[800px] text-gray-900 prose-resume"
                 dangerouslySetInnerHTML={{ __html: html }}
               />
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
