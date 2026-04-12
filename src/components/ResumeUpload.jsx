import { useState, useRef } from 'react';

const STEPS = ['Uploading to Firebase', 'Extracting Text', 'Analyzing Skills & ATS', 'Saving Profile'];

export default function ResumeUpload({ activeRole, onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(-1);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload only PDF or DOCX files.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const startUpload = async () => {
    if (!file) return;
    if (!activeRole) {
      setError('Please provide your desired role to optimize ATS scoring.');
      return;
    }
    
    setError('');
    setProgress(0);
    
    // Simulate multi-step progress visually
    for(let i=1; i<=3; i++) {
        await new Promise(r => setTimeout(r, 1500));
        setProgress(i);
    }
    
    // In a real integration, this calls analyzeAndSave...
    if (onUploadComplete) {
       await onUploadComplete(file, activeRole);
    }
    setProgress(-1);
    setFile(null);
  };

  return (
    <div className="w-full">
      {progress >= 0 ? (
        <div className="bg-dark-card p-12 rounded-3xl border border-white/5 animate-fade-in text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-600 animate-pulse"></div>
          <div className="w-16 h-16 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin mx-auto mb-8 shadow-neon-purple"></div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Analyzing your Resume</h3>
          <p className="text-gray-400 font-medium mb-10">{STEPS[progress]}...</p>
          
          <div className="flex justify-between w-full max-w-xs mx-auto mb-3 text-[10px] font-black text-brand-400 uppercase tracking-widest">
            <span>Progress</span>
            <span>{((progress + 1) / STEPS.length * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full max-w-xs mx-auto bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500 ease-out shadow-neon-glow" 
              style={{ width: `${((progress + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <>
          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          
          <div 
            className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 group ${dragActive ? 'border-brand-500 bg-brand-500/10 shadow-neon-glow' : 'border-white/10 hover:border-brand-500/30 bg-dark-bg'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={inputRef} 
              type="file" 
              className="hidden" 
              accept=".pdf,.docx" 
              onChange={handleChange} 
            />
            
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-10 w-10 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            {file ? (
              <div className="animate-fade-in">
                <p className="text-xl font-black text-white mb-2 tracking-tight">{file.name}</p>
                <p className="text-xs font-bold text-gray-600 mb-8 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setFile(null)} className="btn-secondary rounded-xl px-8">Change file</button>
                  <button onClick={startUpload} className="btn-primary rounded-xl px-10 shadow-neon-glow">Process Resume</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xl font-black text-white mb-2 tracking-tight">Drag and drop your resume here</p>
                <p className="text-sm font-medium text-gray-400 mb-10">Supports PDF or DOCX up to 10MB</p>
                <button onClick={() => inputRef.current.click()} className="btn-secondary rounded-xl px-8 py-3 font-bold">
                  Browse Files
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
