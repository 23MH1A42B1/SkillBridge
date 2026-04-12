import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ResumeUpload from '../components/ResumeUpload';
import { useAuth } from '../auth/AuthContext';
import { analyzeAndSave } from '../services/resumeService';

export default function Upload() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(profile?.desiredRole || '');

  const handleUploadComplete = async (file, activeRole) => {
    try {
      await analyzeAndSave(user.uid, file, activeRole);
      navigate('/profile');
    } catch (error) {
      console.error("Upload process failed", error);
      alert(`Error: ${error.message}`);
      throw error;
    }
  };

  return (
    <AppLayout>
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight">Upload Your Resume</h1>
            <p className="mt-4 text-lg text-gray-400 font-medium">
              Let our AI analyze your resume against industry standards and extract your strategic skills profile.
            </p>
          </div>

          <div className="bg-dark-card p-12 rounded-3xl mb-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-600"></div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
              Desired Role (Required for AI Match)
            </label>
            <input 
              type="text" 
              className="w-full bg-dark-bg border border-white/10 text-white rounded-2xl py-4 px-6 text-xl mb-10 focus:ring-brand-500 font-black tracking-tight placeholder:text-gray-800"
              placeholder="e.g. Senior Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            
            <ResumeUpload 
              activeRole={role} 
              onUploadComplete={handleUploadComplete} 
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
              Your data is encrypted securely via Firebase Storage.
            </p>
          </div>
        </div>
    </AppLayout>
  );
}
