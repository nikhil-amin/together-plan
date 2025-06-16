'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext'; // Assuming WeddingContext is at this path
import { Loader2 } from 'lucide-react';

// This component wraps the page.tsx content to use WeddingProvider
function InitialRedirectPage() {
  const { user, loading: authLoading } = useAuth();
  const { weddingSession, loadingSession } = useWedding();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || (user && loadingSession)) {
      // Still loading auth or session info for an authenticated user
      return;
    }

    if (!user) {
      router.replace('/login');
    } else {
      // User is authenticated
      if (weddingSession) {
        router.replace('/dashboard');
      } else {
        // No active wedding session, or session is null after loading
        router.replace('/welcome');
      }
    }
  }, [user, authLoading, weddingSession, loadingSession, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-6 text-xl font-semibold text-primary-foreground">TogetherPlan</p>
      <p className="text-muted-foreground">Loading your wedding plans...</p>
    </div>
  );
}


// Wrap the page with WeddingProvider because useWedding hook is used inside.
// AuthProvider is already in RootLayout.
import { WeddingProvider } from '@/contexts/WeddingContext';

export default function Home() {
  return (
    <WeddingProvider>
      <InitialRedirectPage />
    </WeddingProvider>
  );
}
