import { useEffect, useMemo, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import SkillCard from '../components/SkillCard';
import { getUserSkills } from '../services/resumeService';
import { getAzureObjectId } from '../services/userService';

export default function Profile() {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() || accounts[0];
  const userId = useMemo(() => getAzureObjectId(account), [account]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await getUserSkills(userId);
        if (active) {
          setProfile(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load skill profile.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Profile</h1>
        <p className="mt-1 text-slate-300">Your extracted skill profile from SharePoint UserSkills list.</p>
      </div>

      {loading && <div className="h-80 animate-pulse rounded-xl bg-slate-700" />}

      {!loading && error && (
        <div className="rounded-xl border border-red-700 bg-red-900/30 p-4 text-red-200">{error}</div>
      )}

      {!loading && !error && <SkillCard profile={profile} />}
    </div>
  );
}
