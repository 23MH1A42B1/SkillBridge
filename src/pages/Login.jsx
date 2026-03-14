import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/msalConfig';

export default function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function signInWithMicrosoft() {
    setError('');
    try {
      const response = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(response.account);
      navigate('/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-blue-400">SkillBridge</p>
        <h1 className="text-3xl font-semibold text-white">AI-powered smart placement portal</h1>
        <p className="mt-3 text-slate-300">
          Sign in with your Microsoft account to access your profile, matches, and resume insights.
        </p>

        <button
          type="button"
          disabled={inProgress !== 'none'}
          onClick={signInWithMicrosoft}
          className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inProgress !== 'none' ? 'Signing in...' : 'Sign in with Microsoft'}
        </button>

        {error && (
          <div className="mt-4 rounded-md border border-red-700 bg-red-900/40 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
