import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SystemProvider } from './context/SystemContext';
import { useAntiInspect } from './hooks/useAntiInspect';
import CommandPalette from './components/CommandPalette';

import { AuthGuard } from './auth/AuthGuard';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import EmailAlerts from './pages/EmailAlerts';
import SmartSearch from './pages/SmartSearch';
import InterviewPrep from './pages/InterviewPrep';
import Roadmap from './pages/Roadmap';
import TailorResume from './pages/TailorResume';
import ApplicationTracker from './pages/ApplicationTracker';
import ResumeManager from './pages/ResumeManager';
import ResumeBuilder from './pages/ResumeBuilder';
import Analytics from './pages/Analytics';
import InterviewSimulator from './pages/InterviewSimulator';
import Negotiator from './pages/Negotiator';
import CareerReport from './pages/CareerReport';
import Support from './pages/Support';

function App() {
  // Disable right-click & DevTools shortcuts site-wide
  // Set blurOnDetect: true to also blur the page when DevTools are open
  // useAntiInspect({ enabled: true, blurOnDetect: false });

  return (
    <ToastProvider>
    <SystemProvider>
    <BrowserRouter>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthGuard requireAuth={false}><Login /></AuthGuard>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/upload" element={<AuthGuard><Upload /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/jobs" element={<AuthGuard><Jobs /></AuthGuard>} />
        <Route path="/smart-search" element={<AuthGuard><SmartSearch /></AuthGuard>} />
        <Route path="/email-alerts" element={<AuthGuard><EmailAlerts /></AuthGuard>} />
        <Route path="/interview-prep/:jobId" element={<AuthGuard><InterviewPrep /></AuthGuard>} />
        <Route path="/roadmap/:jobId" element={<AuthGuard><Roadmap /></AuthGuard>} />
        <Route path="/tailor-resume/:jobId" element={<AuthGuard><TailorResume /></AuthGuard>} />
        <Route path="/tracker" element={<AuthGuard><ApplicationTracker /></AuthGuard>} />
        <Route path="/resumes" element={<AuthGuard><ResumeManager /></AuthGuard>} />
        <Route path="/resume-builder" element={<AuthGuard><ResumeBuilder /></AuthGuard>} />
        <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
        <Route path="/interview-simulator/:jobId" element={<AuthGuard><InterviewSimulator /></AuthGuard>} />
        <Route path="/negotiator" element={<AuthGuard><Negotiator /></AuthGuard>} />
        <Route path="/career-report" element={<AuthGuard><CareerReport /></AuthGuard>} />
        <Route path="/support" element={<AuthGuard><Support /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
    </SystemProvider>
    </ToastProvider>
  );
}

export default App;
