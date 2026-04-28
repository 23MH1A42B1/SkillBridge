import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Only allow the whitelisted admin email
        if (firebaseUser.email === ADMIN_EMAIL) {
          // Check role in firestore
          let role = 'super';
          try {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
            if (adminDoc.exists()) {
              role = adminDoc.data().role || 'moderator';
            }
          } catch (e) { console.error("Error fetching admin role", e); }

          setAdmin({
            uid:   firebaseUser.uid,
            email: firebaseUser.email,
            name:  firebaseUser.displayName || 'Admin',
            role,
          });
        } else {
          // Not the admin — sign them out immediately
          await signOut(auth);
          setAdmin(null);
          setAuthError('Access denied. You are not authorized as an admin.');
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    setAuthError('');
    try {
      if (email !== ADMIN_EMAIL) {
        setAuthError('This email is not authorized for admin access.');
        return false;
      }
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      const msgs = {
        'auth/user-not-found':  'No admin account found. Create one in Firebase Console.',
        'auth/wrong-password':  'Incorrect password.',
        'auth/invalid-email':   'Invalid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
        'auth/invalid-credential': 'Invalid credentials. Check your email & password.',
      };
      setAuthError(msgs[err.code] || err.message);
      return false;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, authError, setAuthError, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
