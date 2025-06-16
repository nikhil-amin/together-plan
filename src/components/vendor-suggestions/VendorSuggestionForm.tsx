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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { suggestVendors, type SuggestVendorsInput, type SuggestVendorsOutput } from '@/ai/flows/suggest-vendors';
import { useToast } from '@/hooks/use-toast';
import type { Vendor } from '@/lib/types';
import Image from 'next/image';

const vendorSuggestionSchema = z.object({
  location: z.string().min(3, { message: 'Location is required (e.g., city, state).' }),
  vendorType: z.string().min(3, { message: 'Vendor type is required (e.g., photographer, florist).' }),
  budget: z.string().optional(),
  style: z.string().optional(),
  additionalCriteria: z.string().optional(),
});

type VendorSuggestionFormValues = z.infer<typeof vendorSuggestionSchema>;

export function VendorSuggestionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Vendor[]>([]);
  const { toast } = useToast();

  const form = useForm<VendorSuggestionFormValues>({
    resolver: zodResolver(vendorSuggestionSchema),
    defaultValues: {
      location: '',
      vendorType: '',
      budget: '',
      style: '',
      additionalCriteria: '',
    },
  });

  async function onSubmit(values: VendorSuggestionFormValues) {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result: SuggestVendorsOutput = await suggestVendors(values);
      if (result.vendors && result.vendors.length > 0) {
        setSuggestions(result.vendors);
        toast({ title: 'Suggestions Found!', description: `Found ${result.vendors.length} vendors for you.` });
      } else {
        toast({ title: 'No Suggestions', description: 'Could not find vendors matching your criteria. Try adjusting your search.' });
      }
    } catch (error: any) {
      console.error('Error getting vendor suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: error.message || 'Failed to get suggestions from AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center text-primary">
            <Sparkles className="mr-2 h-6 w-6" /> Find Your Perfect Vendors
          </CardTitle>
          <CardDescription>Let our AI assistant help you discover vendors for your big day!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Photographer, Florist, Caterer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $2000-$3000, budget-friendly" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style/Theme (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rustic, Modern, Classic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="additionalCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Looking for vegan options, prefers candid photography..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Our AI is searching for vendors...</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Vendor Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((vendor, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                </CardHeader>
                 <Image src={`https://placehold.co/600x400.png?cx=${Math.random()}`} alt={vendor.name} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint="vendor event" />
                <CardContent className="flex-grow pt-4">
                  <p className="text-sm text-muted-foreground mb-2">{vendor.description}</p>
                  <p className="text-sm"><strong>Contact:</strong> {vendor.contactInfo}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
