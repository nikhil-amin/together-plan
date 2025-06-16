
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { useAuth } from '@/contexts/AuthContext';
import { WeddingProvider, useWedding } from '@/contexts/WeddingContext';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Header } from '@/components/layout/Header';
import { Loader2 } from 'lucide-react';

function AppLayoutContent({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { weddingSession, loadingSession } = useWedding();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    if (authLoading) return; 

    if (!user) {
      router.replace('/login');
      return;
    }

    if (loadingSession) return; 
    
    // Check if user is authenticated, session is loaded, but no weddingSession exists,
    // and we are not already on the welcome page.
    if (user && !weddingSession && pathname !== '/welcome') {
        router.replace('/welcome');
    }

  }, [user, authLoading, weddingSession, loadingSession, router, pathname]); // Added pathname

  // Initial loading state: waiting for auth or (if auth succeeded) for session
  if (authLoading || (user && loadingSession) ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your plans...</p>
      </div>
    );
  }
  
  // Specific loading state: user is loaded, session is loaded (and is null),
  // and we are not on the welcome page (implies redirect to /welcome is pending or needed).
  if (user && !weddingSession && pathname !== '/welcome') {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Setting up your space...</p>
      </div>
    );
  }

  // If user is authenticated and has a wedding session, OR if user is authenticated
  // and is on the welcome page (because they have no session yet), show content.
  // Also covers the case where user is null and redirect to /login is pending (will show brief loader then redirect).
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
    