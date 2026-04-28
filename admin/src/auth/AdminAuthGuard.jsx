import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export function AdminAuthGuard({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;
  return children;
}

export function PublicGuard({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  if (admin) return <Navigate to="/dashboard" replace />;
  return children;
}
