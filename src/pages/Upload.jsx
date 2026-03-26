import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Upload Your Resume</h1>
            <p className="mt-3 text-lg text-gray-500">
              Let our AI analyze your resume against industry standards and extract your skills profile.
            </p>
          </div>

          <div className="glass-card p-8 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Role (Required for Accurate ATS Scoring)
            </label>
            <input 
              type="text" 
              className="input-field py-3 px-4 text-lg mb-8"
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
      </main>
    </div>
  );
}
