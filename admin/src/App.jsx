import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './auth/AdminAuthContext';
import { AdminAuthGuard, PublicGuard } from './auth/AdminAuthGuard';

import AdminLogin      from './pages/AdminLogin';
import AdminDashboard  from './pages/AdminDashboard';
import UsersPage       from './pages/UsersPage';
import ResumesPage     from './pages/ResumesPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import InterviewsPage  from './pages/InterviewsPage';
import EmailsPage      from './pages/EmailsPage';
import SystemConfigPage from './pages/SystemConfigPage';
import AuditLogPage    from './pages/AuditLogPage';
import SupportPage     from './pages/SupportPage';
import EmployersPage   from './pages/EmployersPage';

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            <PublicGuard><AdminLogin /></PublicGuard>
          } />

          {/* Protected Admin Routes */}
          <Route path="/dashboard"  element={<AdminAuthGuard><AdminDashboard  /></AdminAuthGuard>} />
          <Route path="/users"      element={<AdminAuthGuard><UsersPage       /></AdminAuthGuard>} />
          <Route path="/resumes"    element={<AdminAuthGuard><ResumesPage     /></AdminAuthGuard>} />
          <Route path="/analytics"  element={<AdminAuthGuard><AnalyticsPage   /></AdminAuthGuard>} />
          <Route path="/interviews" element={<AdminAuthGuard><InterviewsPage  /></AdminAuthGuard>} />
          <Route path="/emails"     element={<AdminAuthGuard><EmailsPage      /></AdminAuthGuard>} />
          <Route path="/config"     element={<AdminAuthGuard><SystemConfigPage /></AdminAuthGuard>} />
          <Route path="/audit"      element={<AdminAuthGuard><AuditLogPage    /></AdminAuthGuard>} />
          <Route path="/support"    element={<AdminAuthGuard><SupportPage     /></AdminAuthGuard>} />
          <Route path="/employers"  element={<AdminAuthGuard><EmployersPage   /></AdminAuthGuard>} />

          {/* Default */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
