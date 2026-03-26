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

  useEffect(() => {
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
    return unsubscribe;
  }, []);

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
