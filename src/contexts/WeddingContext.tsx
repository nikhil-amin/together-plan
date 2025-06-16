'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { WeddingSession, UserProfile } from '@/lib/types';
import { useAuth } from './AuthContext';
import { getUserActiveWeddingSession, getWeddingSession } from '@/lib/firebase/firestore';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface WeddingContextType {
  weddingSession: WeddingSession | null;
  setWeddingSession: (session: WeddingSession | null) => void;
  loadingSession: boolean;
  refreshWeddingSession: () => Promise<void>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [weddingSession, setWeddingSession] = useState<WeddingSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const fetchAndSetSession = async (currentUser: UserProfile) => {
    setLoadingSession(true);
    if (currentUser.activeWeddingId) {
      try {
        const session = await getWeddingSession(currentUser.activeWeddingId);
        setWeddingSession(session);
      } catch (error) {
        console.error("Error fetching wedding session:", error);
        setWeddingSession(null);
      }
    } else {
      setWeddingSession(null);
    }
    setLoadingSession(false);
  };
  
  const refreshWeddingSession = async () => {
    if (user) {
      await fetchAndSetSession(user);
    }
  };


  useEffect(() => {
    if (authLoading) {
      setLoadingSession(true);
      return;
    }

    if (user) {
      fetchAndSetSession(user);
    } else {
      setWeddingSession(null);
      setLoadingSession(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (user?.activeWeddingId) {
      const sessionRef = doc(db, 'weddings', user.activeWeddingId);
      unsubscribe = onSnapshot(sessionRef, (docSnap) => {
        if (docSnap.exists()) {
          setWeddingSession({ id: docSnap.id, ...docSnap.data() } as WeddingSession);
        } else {
          setWeddingSession(null);
        }
        setLoadingSession(false);
      }, (error) => {
        console.error("Error listening to wedding session:", error);
        setWeddingSession(null);
        setLoadingSession(false);
      });
    } else {
      setWeddingSession(null);
      setLoadingSession(false);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.activeWeddingId]);


  return (
    <WeddingContext.Provider value={{ weddingSession, setWeddingSession, loadingSession, refreshWeddingSession }}>
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
