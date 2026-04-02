import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonated, setIsImpersonated] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check URL for new impersonation request
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('impersonate');
      if (tokenFromUrl) {
        sessionStorage.setItem('impersonateToken', tokenFromUrl);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const activeToken = sessionStorage.getItem('impersonateToken');

      if (activeToken) {
        try {
          const tokenSnap = await getDoc(doc(db, 'admin', 'impersonations', 'tokens', activeToken));
          if (tokenSnap.exists()) {
            const data = tokenSnap.data();
            const now = new Date();
            if (new Date(data.expiresAt) > now) {
              // Valid impersonation!
              setIsImpersonated(true);
              const targetUid = data.targetUid;
              setUser({ uid: targetUid, email: 'impersonated@skillbridge.com', isImpersonated: true });
              
              const profileSnap = await getDoc(doc(db, 'users', targetUid));
              if (profileSnap.exists()) setProfile(profileSnap.data());
              
              setLoading(false);
              return; // Bypass normal auth!
            } else {
              console.warn("Impersonation token expired");
              sessionStorage.removeItem('impersonateToken');
            }
          } else {
            console.warn("Invalid impersonation token");
            sessionStorage.removeItem('impersonateToken');
          }
        } catch (err) {
          console.error("Failed to verify impersonation", err);
          sessionStorage.removeItem('impersonateToken');
        }
      }

      // 2. Normal Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setProfile(docSnap.data());
            }
          } catch (error) {
            console.error("Failed to load user profile:", error);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      
      return () => unsubscribe && unsubscribe();
    };

    handleAuth();
  }, []);

  const endImpersonation = () => {
    sessionStorage.removeItem('impersonateToken');
    window.location.href = '/login';
  };


  const signUp = async (email, password, fullName, college, desiredRole) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        uid: user.uid,
        email,
        fullName,
        college,
        desiredRole,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      setProfile(userData);
      return { user };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        lastLoginAt: new Date().toISOString()
      });
      return { user };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isImpersonated,
    endImpersonation,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
