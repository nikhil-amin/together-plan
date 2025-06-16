'use client';

import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export function GoogleSignInButton() {
  const { setIsAuthenticating } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await signInWithGoogle();
      // AuthProvider will handle redirect or state update
      // router.push('/'); // Or let AuthProvider handle redirect
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign-in failed",
        description: error.message || "Could not sign in with Google. Please try again.",
      });
      setIsAuthenticating(false);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
      <LogIn className="mr-2 h-4 w-4" /> Sign in with Google
    </Button>
  );
}
