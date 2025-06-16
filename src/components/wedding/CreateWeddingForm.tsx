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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { createWeddingSession } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  weddingDate: z.date({
    required_error: 'Wedding date is required.',
  }),
});

export function CreateWeddingForm() {
  const { user } = useAuth();
  const { refreshWeddingSession } = useWedding();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weddingDate: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a wedding.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newSession = await createWeddingSession(user.uid, values.weddingDate);
      await refreshWeddingSession(); // This will update the context and trigger redirect via (app)/layout or page listeners
      toast({ title: 'Success!', description: `Wedding session created for ${format(values.weddingDate, "PPP")}.` });
      // router.push('/dashboard'); // Let WeddingContext listener handle redirect
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to create wedding', description: error.message });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="weddingDate"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-lg font-medium">Select Your Wedding Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Wedding
        </Button>
      </form>
    </Form>
  );
}
