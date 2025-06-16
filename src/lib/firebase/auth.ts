import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password_1: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password_1);
  const firebaseUser = userCredential.user;
  await firebaseUpdateProfile(firebaseUser, { displayName });

  const userProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: displayName,
    photoURL: firebaseUser.photoURL,
    activeWeddingId: null,
  };
  await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
  return userProfile;
};

export const signInWithEmail = async (email: string, password_1: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password_1);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  return userDoc.data() as UserProfile;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUserProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      activeWeddingId: null,
    };
    await setDoc(userRef, newUserProfile);
    return newUserProfile;
  }
  return userSnap.data() as UserProfile;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
  const updatedUserSnap = await getDoc(userRef);
  return updatedUserSnap.data() as UserProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
};
