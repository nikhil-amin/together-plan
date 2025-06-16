import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';
import type { WeddingSession, Task, TaskStatus, UserProfile } from '@/lib/types';

// Helper to generate a simple random code
const generateShareCode = (length = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Wedding Session Functions
export const createWeddingSession = async (ownerId: string, weddingDate: Date): Promise<WeddingSession> => {
  const weddingDateTimestamp = Timestamp.fromDate(weddingDate);
  const shareCode = generateShareCode();
  const newSessionRef = await addDoc(collection(db, 'weddings'), {
    ownerId,
    partnerIds: [ownerId],
    weddingDate: weddingDateTimestamp,
    shareCode,
    createdAt: serverTimestamp(),
  });

  // Update user's activeWeddingId
  await updateDoc(doc(db, 'users', ownerId), { activeWeddingId: newSessionRef.id });

  return { 
    id: newSessionRef.id, 
    ownerId, 
    partnerIds: [ownerId], 
    weddingDate: weddingDateTimestamp, 
    shareCode,
    createdAt: Timestamp.now() // Approximate client-side, server will override
  } as WeddingSession;
};

export const getWeddingSession = async (sessionId: string): Promise<WeddingSession | null> => {
  const sessionDoc = await getDoc(doc(db, 'weddings', sessionId));
  if (sessionDoc.exists()) {
    return { id: sessionDoc.id, ...sessionDoc.data() } as WeddingSession;
  }
  return null;
};

export const joinWeddingSession = async (sessionId: string, userId: string): Promise<WeddingSession | null> => {
  const sessionRef = doc(db, 'weddings', sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    throw new Error('Wedding session not found.');
  }

  const sessionData = sessionSnap.data() as WeddingSession;
  if (sessionData.partnerIds.includes(userId)) {
     // User already part of session, update activeWeddingId if necessary
    await updateDoc(doc(db, 'users', userId), { activeWeddingId: sessionId });
    return { id: sessionSnap.id, ...sessionData };
  }
  
  if (sessionData.partnerIds.length >= 2) {
    throw new Error('Wedding session is full.');
  }

  await updateDoc(sessionRef, {
    partnerIds: arrayUnion(userId),
  });
  await updateDoc(doc(db, 'users', userId), { activeWeddingId: sessionId });
  
  const updatedSessionSnap = await getDoc(sessionRef);
  return { id: updatedSessionSnap.id, ...updatedSessionSnap.data() } as WeddingSession;
};

export const findWeddingSessionByShareCode = async (shareCode: string): Promise<WeddingSession | null> => {
  const q = query(collection(db, 'weddings'), where('shareCode', '==', shareCode));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const sessionDoc = querySnapshot.docs[0];
    return { id: sessionDoc.id, ...sessionDoc.data() } as WeddingSession;
  }
  return null;
};


export const updateWeddingSession = async (sessionId: string, data: Partial<WeddingSession>) => {
  await updateDoc(doc(db, 'weddings', sessionId), data);
};

export const leaveWeddingSession = async (sessionId: string, userId: string) => {
  const sessionRef = doc(db, 'weddings', sessionId);
  await updateDoc(sessionRef, {
    partnerIds: arrayRemove(userId)
  });
  // Clear activeWeddingId for the user
  await updateDoc(doc(db, 'users', userId), { activeWeddingId: null });
};

export const deleteWeddingSession = async (sessionId: string) => {
  // Add logic to delete associated tasks, etc. if needed
  await deleteDoc(doc(db, 'weddings', sessionId));
  // Could also clear activeWeddingId for all partners
};

// Task Functions
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'lastUpdatedAt'>): Promise<Task> => {
  const newTaskRef = await addDoc(collection(db, 'tasks'), {
    ...taskData,
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  });
  return { id: newTaskRef.id, ...taskData, createdAt: Timestamp.now(), lastUpdatedAt: Timestamp.now() } as Task;
};

export const getTasksForSession = async (weddingId: string): Promise<Task[]> => {
  const q = query(collection(db, 'tasks'), where('weddingId', '==', weddingId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const updateTask = async (taskId: string, data: Partial<Task>) => {
  await updateDoc(doc(db, 'tasks', taskId), {
    ...data,
    lastUpdatedAt: serverTimestamp(),
  });
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, 'tasks', taskId));
};

export const getTask = async (taskId: string): Promise<Task | null> => {
  const taskDoc = await getDoc(doc(db, 'tasks', taskId));
  return taskDoc.exists() ? ({ id: taskDoc.id, ...taskDoc.data() } as Task) : null;
};

// User Profile related to Wedding Session
export const getUserActiveWeddingSession = async (userId: string): Promise<WeddingSession | null> => {
  const userProfileDoc = await getDoc(doc(db, 'users', userId));
  if (userProfileDoc.exists()) {
    const userProfile = userProfileDoc.data() as UserProfile;
    if (userProfile.activeWeddingId) {
      return getWeddingSession(userProfile.activeWeddingId);
    }
  }
  return null;
};
