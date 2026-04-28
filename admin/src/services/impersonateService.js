import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function createImpersonationToken(adminEmail, targetUid) {
  // Generate a random token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Set expiration to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
  
  // Save to Firestore
  await setDoc(doc(db, 'admin', 'impersonations', 'tokens', token), {
    adminEmail,
    targetUid,
    expiresAt,
    used: false
  });
  
  return token;
}
