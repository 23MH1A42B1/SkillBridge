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
        <div className="glass-card p-8 animate-fade-in text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing your Resume</h3>
          <p className="text-gray-500 mb-8">{STEPS[progress]}...</p>
          
          <div className="flex justify-between w-full max-w-sm mx-auto mb-2 text-xs font-medium text-brand-600">
            <span>Progress</span>
            <span>{((progress + 1) / STEPS.length * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full max-w-sm mx-auto bg-gray-200 rounded-full h-2">
            <div 
              className="bg-brand-600 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${((progress + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <>
          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400 bg-white'}`}
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
            
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            {file ? (
              <div className="animate-fade-in">
                <p className="text-lg font-medium text-gray-900 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setFile(null)} className="btn-secondary">Change file</button>
                  <button onClick={startUpload} className="btn-primary">Process Resume</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">Drag and drop your resume here</p>
                <p className="text-sm text-gray-500 mb-6">Supports PDF or DOCX up to 10MB</p>
                <button onClick={() => inputRef.current.click()} className="btn-secondary">
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
