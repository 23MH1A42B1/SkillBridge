import { 
  collection, addDoc, onSnapshot, query, 
  orderBy, doc, updateDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export const subscribeToChats = (callback) => {
  const chatsRef = collection(db, 'support_chats');
  const q = query(chatsRef, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(chats);
  });
};

export const subscribeToChatMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'support_chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

export const sendAdminMessage = async (chatId, text, adminName = 'Admin') => {
  const chatRef = doc(db, 'support_chats', chatId);
  const messagesRef = collection(chatRef, 'messages');
  
  await addDoc(messagesRef, {
    text,
    role: 'admin',
    senderName: adminName,
    timestamp: serverTimestamp(),
  });

  await updateDoc(chatRef, {
    lastMessage: text,
    updatedAt: serverTimestamp(),
    unreadCount: 0 // Reset for admin when they respond
  });
};

export const closeChat = async (chatId) => {
  const chatRef = doc(db, 'support_chats', chatId);
  await updateDoc(chatRef, {
    status: 'closed',
    updatedAt: serverTimestamp(),
  });
};
