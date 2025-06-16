'use client';

import { CreateWeddingForm } from '@/components/wedding/CreateWeddingForm';
import { JoinWeddingForm } from '@/components/wedding/JoinWeddingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth();
  const { weddingSession, loadingSession } = useWedding();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login'); // Should not happen if (app) layout protects this
    }
    if (!loadingSession && weddingSession) {
      router.replace('/dashboard'); // Already in a session, redirect
    }
  }, [user, authLoading, weddingSession, loadingSession, router]);


  if (authLoading || loadingSession || (!authLoading && !user) || (!loadingSession && weddingSession)) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-var(--header-height,4rem))] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Welcome to TogetherPlan!</CardTitle>
          <CardDescription className="text-lg">
            Let&apos;s get started with your wedding planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Wedding</TabsTrigger>
              <TabsTrigger value="join">Join Wedding</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="pt-6">
              <CreateWeddingForm />
            </TabsContent>
            <TabsContent value="join" className="pt-6">
              <JoinWeddingForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
