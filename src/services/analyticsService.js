import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const logTokenUsage = async (userId, model, tokensUsed) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'admin', 'tokenUsage', 'daily', today);
    
    // Update daily total
    const statsSnap = await getDoc(statsRef);
    if (!statsSnap.exists()) {
      await setDoc(statsRef, {
        totalTokens: tokensUsed,
        calls: 1,
        models: { [model]: tokensUsed },
        date: today
      });
    } else {
      await updateDoc(statsRef, {
        totalTokens: increment(tokensUsed),
        calls: increment(1),
        [`models.${model}`]: increment(tokensUsed)
      });
    }

    // Optional: Log per-user usage for limit enforcement
    const userStatsRef = doc(db, 'userAnalytics', userId);
    const userSnap = await getDoc(userStatsRef);
    if (!userSnap.exists()) {
      await setDoc(userStatsRef, {
        totalTokens: tokensUsed,
        lastActive: new Date().toISOString()
      });
    } else {
      await updateDoc(userStatsRef, {
        totalTokens: increment(tokensUsed),
        lastActive: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Failed to log token usage:", error);
  }
};
