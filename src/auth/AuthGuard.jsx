import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import Login from '../pages/Login';
import { ensureUserRegistered, getAzureObjectId } from '../services/userService';

export default function AuthGuard({ children }) {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts, inProgress } = useMsal();
  const location = useLocation();
  const [syncingUser, setSyncingUser] = useState(false);
  const syncedUserRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function syncUser() {
      if (!isAuthenticated) {
        syncedUserRef.current = null;
        setSyncingUser(false);
        return;
      }

      const account = instance.getActiveAccount() || accounts[0];
      if (!account) {
        setSyncingUser(false);
        return;
      }

      instance.setActiveAccount(account);
      const userId = getAzureObjectId(account);

      if (!userId || syncedUserRef.current === userId) {
        setSyncingUser(false);
        return;
      }

      setSyncingUser(true);
      try {
        await ensureUserRegistered(account);
        if (active) {
          syncedUserRef.current = userId;
        }
      } finally {
        if (active) {
          setSyncingUser(false);
        }
      }
    }

    syncUser();

    return () => {
      active = false;
    };
  }, [accounts, instance, isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  if (inProgress !== 'none' || syncingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="w-80 animate-pulse rounded-xl bg-slate-800 p-6 text-center text-slate-200">
          Preparing your SkillBridge workspace...
        </div>
      </div>
    );
  }

  if (location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
