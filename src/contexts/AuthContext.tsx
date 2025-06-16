'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [isAuthenticating, setIsAuthenticating] = useState(false); // For login/signup process
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data() as UserProfile);
        } else {
          // Create a new user profile document if it doesn't exist
          const newUserProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            activeWeddingId: null,
          };
          await setDoc(userRef, newUserProfile);
          setUser(newUserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setIsAuthenticating(false);
    });

    return () => unsubscribe();
  }, [router]);

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
