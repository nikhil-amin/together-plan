
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { WeddingSession, UserProfile } from '@/lib/types';
import { useAuth } from './AuthContext';
import { getWeddingSession } from '@/lib/firebase/firestore'; // getWeddingSession for explicit refresh
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface WeddingContextType {
  weddingSession: WeddingSession | null;
  setWeddingSession: (session: WeddingSession | null) => void;
  loadingSession: boolean;
  // refreshWeddingSession: () => Promise<void>; // Kept for settings page for now, but its necessity is reduced
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [weddingSession, setWeddingSession] = useState<WeddingSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoadingSession(true); // Auth is loading, so session status is also pending
      return;
    }

    let unsubscribe: (() => void) | undefined;

    if (user?.activeWeddingId && db) { // Ensure db is initialized
      setLoadingSession(true); // Starting to fetch/listen for a session
      const sessionRef = doc(db, 'weddings', user.activeWeddingId);
      unsubscribe = onSnapshot(sessionRef, (docSnap) => {
        if (docSnap.exists()) {
          setWeddingSession({ id: docSnap.id, ...docSnap.data() } as WeddingSession);
        } else {
          // This case means activeWeddingId points to a non-existent or deleted session.
          setWeddingSession(null);
          // Consider automatically clearing user.activeWeddingId here if this happens frequently
          // e.g., by calling a function to updateUserProfile(user.uid, { activeWeddingId: null });
          console.warn(`Firestore_WeddingContext: Active wedding session ${user.activeWeddingId} not found.`);
        }
        setLoadingSession(false);
      }, (error) => {
        console.error("Firestore_WeddingContext: Error listening to wedding session:", error);
        setWeddingSession(null);
        setLoadingSession(false);
      });
    } else {
      // No authenticated user, or user has no activeWeddingId.
      setWeddingSession(null);
      setLoadingSession(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]); // Re-run when user object (and thus activeWeddingId) or authLoading changes

  // Expose setWeddingSession for direct manipulation if needed (e.g., on leave/delete session)
  // refreshWeddingSession is less critical if the snapshot works well, but kept for explicitness in settings.
  // const refreshWeddingSession = useCallback(async () => {
  //   if (authLoading) return;
  //   if (user?.activeWeddingId && db) {
  //     setLoadingSession(true);
  //     try {
  //       const session = await getWeddingSession(user.activeWeddingId);
  //       setWeddingSession(session);
  //     } catch (error) {
  //       console.error("Error explicitly refreshing wedding session:", error);
  //       setWeddingSession(null);
  //     }
  //     setLoadingSession(false);
  //   } else {
  //     setWeddingSession(null);
  //     setLoadingSession(false);
  //   }
  // }, [user, authLoading]);


  return (
    <WeddingContext.Provider value={{ weddingSession, setWeddingSession, loadingSession }}>
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
    