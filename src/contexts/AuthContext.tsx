
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'; // Added onSnapshot
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticating: boolean;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  // useRouter is not directly used in this effect, but kept for context if needed elsewhere.
  // const router = useRouter(); 

  useEffect(() => {
    let userDocUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // Clean up previous user document listener if any
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = undefined;
      }

      if (firebaseUser && db) { // Ensure db is initialized
        const userRef = doc(db, 'users', firebaseUser.uid);
        // Set loading true while we subscribe and get initial user doc
        // This helps manage state if user doc takes time to load/confirm
        setLoading(true); 

        userDocUnsubscribe = onSnapshot(userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUser(docSnap.data() as UserProfile);
            } else {
              // This case implies user is authenticated with Firebase Auth,
              // but their profile document in Firestore is missing.
              // This should ideally be handled by signUp/signInWithGoogle creating the document.
              // If it's missing post-signup, it's an inconsistent state.
              // For robustness, provide a minimal profile based on Firebase Auth data.
              console.warn(`Firestore user profile for UID ${firebaseUser.uid} not found. Using minimal profile from Auth.`);
              const minimalProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                activeWeddingId: null, // Critical: default to null if no Firestore doc
              };
              setUser(minimalProfile);
              // Optionally, try to create the doc here if it's truly missing and should exist
              // setDoc(userRef, minimalProfile).catch(e => console.error("Error creating missing user profile in AuthContext:", e));
            }
            setLoading(false); // Profile loaded or determined missing
            setIsAuthenticating(false); // Auth process complete
          },
          (error) => {
            console.error("Error listening to user document:", error);
            setUser(null);
            setLoading(false);
            setIsAuthenticating(false);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
        setIsAuthenticating(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []); // Empty dependency array: onAuthStateChanged and onSnapshot manage their own lifecycles

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticating, setIsAuthenticating }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
    