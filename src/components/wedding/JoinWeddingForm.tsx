'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { findWeddingSessionByShareCode, joinWeddingSession } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  shareCode: z.string().min(6, { message: 'Share code must be at least 6 characters.' }).max(10, {message: 'Share code too long.'}),
});

export function JoinWeddingForm() {
  const { user } = useAuth();
  const { refreshWeddingSession } = useWedding();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shareCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to join a wedding.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const sessionToJoin = await findWeddingSessionByShareCode(values.shareCode.toUpperCase());
      if (!sessionToJoin) {
        toast({ variant: 'destructive', title: 'Not Found', description: 'Invalid share code. Please check and try again.' });
        setIsSubmitting(false);
        return;
      }
      await joinWeddingSession(sessionToJoin.id, user.uid);
      await refreshWeddingSession();
      toast({ title: 'Success!', description: 'You have joined the wedding session.' });
      // router.push('/dashboard'); // Let WeddingContext listener handle redirect
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to join wedding', description: error.message });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="shareCode"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-lg font-medium">Enter Share Code</FormLabel>
              <FormControl>
                <Input placeholder="ABCXYZ" {...field} className="uppercase text-center tracking-widest text-lg h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Join Wedding
        </Button>
      </form>
    </Form>
  );
}
