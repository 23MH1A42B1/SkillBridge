import { doc, getDoc, updateDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const getUserProfile = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (userId, fields) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, fields);
};

export const ensureUserExists = async (firebaseUser, additionalData = {}) => {
  const docRef = doc(db, 'users', firebaseUser.uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await setDoc(docRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      createdAt: new Date().toISOString(),
      ...additionalData
    });
  }
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => doc.data());
};
