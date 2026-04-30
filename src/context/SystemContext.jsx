import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from './ToastContext';

const SystemContext = createContext(null);

export function SystemProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Listen to admin system config in real-time
    const unsubscribe = onSnapshot(doc(db, 'admin', 'systemConfig'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig(data);

        // Apply Dynamic Branding
        if (data.branding) {
          const root = document.documentElement;
          if (data.branding.primaryColor) root.style.setProperty('--brand-500', data.branding.primaryColor);
          if (data.branding.primaryColor) root.style.setProperty('--brand-600', data.branding.primaryColor + 'dd');
          if (data.branding.borderRadius) root.style.setProperty('--radius-xl', data.branding.borderRadius + 'px');
        }
      } else {
        // Fallback default config if not yet created by admin
        setConfig({
          features: {
            interviewSimulator: true,
            aiResumeBuilder: true,
            smartSearch: true,
            negotiator: true,
            emailAlerts: true,
            careerReport: true,
            linkedInOptimizer: true,
          },
          maintenance: {
            enabled: false,
            message: '',
          }
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching system config:", error);
      // Failsafe config
      setConfig({ features: {}, maintenance: { enabled: false } });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Listen for live announcements
    const unsubscribe = onSnapshot(doc(db, 'admin', 'liveAnnouncement'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        const annDate = new Date(data.timestamp);
        
        // Only show if the announcement was made in the last 2 minutes
        // This prevents showing old announcements when the user first logs in
        if ((now - annDate) < 120000) {
          // Add a small delay so it doesn't clash with route transitions
          setTimeout(() => {
            showToast(data.message, data.type || 'info');
          }, 500);
        }
      }
    });
    return unsubscribe;
  }, [showToast]);

  return (
    <SystemContext.Provider value={{ config, loading }}>
      {children}
    </SystemContext.Provider>
  );
}

export const useSystem = () => useContext(SystemContext);
