import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './auth/AuthGuard';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import EmailAlerts from './pages/EmailAlerts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthGuard requireAuth={false}><Login /></AuthGuard>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/upload" element={<AuthGuard><Upload /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/jobs" element={<AuthGuard><Jobs /></AuthGuard>} />
        <Route path="/email-alerts" element={<AuthGuard><EmailAlerts /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
