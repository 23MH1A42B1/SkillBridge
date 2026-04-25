import { 
  collection, addDoc, onSnapshot, query, 
  orderBy, doc, setDoc, updateDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const startOrGetChat = async (userId, userName) => {
  const chatRef = doc(db, 'support_chats', userId);
  await setDoc(chatRef, {
    userId,
    userName,
    status: 'open',
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return chatRef;
};

export const sendMessage = async (userId, text, role = 'user', senderName = 'User') => {
  const chatRef = doc(db, 'support_chats', userId);
  const messagesRef = collection(chatRef, 'messages');
  
  await addDoc(messagesRef, {
    text,
    role,
    senderName,
    timestamp: serverTimestamp(),
  });

  await updateDoc(chatRef, {
    lastMessage: text,
    updatedAt: serverTimestamp(),
    ...(role === 'user' ? { unreadCount: 1 } : { unreadCount: 0 })
  });
};

export const subscribeToMessages = (userId, callback) => {
  const messagesRef = collection(db, 'support_chats', userId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};
