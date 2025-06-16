'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { WeddingProvider, useWedding } from '@/contexts/WeddingContext';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Header } from '@/components/layout/Header';
import { Loader2 } from 'lucide-react';

function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { weddingSession, loadingSession } = useWedding();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (!user) {
      router.replace('/login');
      return;
    }

    // After auth is resolved, wait for session to resolve if user exists
    if (loadingSession) return; 
    
    if (user && !weddingSession && router.pathname !== '/welcome') {
        router.replace('/welcome');
    }

  }, [user, authLoading, weddingSession, loadingSession, router]);

  if (authLoading || (user && loadingSession) ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your plans...</p>
      </div>
    );
  }
  
  // If user is loaded, but no session, and we are not on welcome page, means redirect is pending.
  // Show loader to prevent flicker of content before redirect to /welcome.
  if (user && !weddingSession && router.pathname !== '/welcome') {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Setting up your space...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0 pt-4 container mx-auto px-4">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <WeddingProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </WeddingProvider>
  );
}
