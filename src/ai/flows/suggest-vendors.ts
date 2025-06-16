'use server';

/**
 * @fileOverview Vendor suggestion AI agent.
 *
 * - suggestVendors - A function that suggests vendors based on wedding criteria.
 * - SuggestVendorsInput - The input type for the suggestVendors function.
 * - SuggestVendorsOutput - The return type for the suggestVendors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestVendorsInputSchema = z.object({
  location: z.string().describe('The location of the wedding.'),
  vendorType: z.string().describe('The type of vendor to suggest (e.g., photographer, florist, caterer).'),
  budget: z.string().optional().describe('The budget for the vendor. (e.g., $1000-$2000, or budget-friendly)'),
  style: z.string().optional().describe('The desired style or theme (e.g., rustic, modern, classic).'),
  additionalCriteria: z.string().optional().describe('Any additional criteria or preferences.'),
});
export type SuggestVendorsInput = z.infer<typeof SuggestVendorsInputSchema>;

const SuggestVendorsOutputSchema = z.object({
  vendors: z.array(
    z.object({
      name: z.string().describe('The name of the vendor.'),
      description: z.string().describe('A brief description of the vendor.'),
      contactInfo: z.string().describe('The contact information for the vendor.'),
    })
  ).describe('A list of suggested vendors.'),
});
export type SuggestVendorsOutput = z.infer<typeof SuggestVendorsOutputSchema>;

export async function suggestVendors(input: SuggestVendorsInput): Promise<SuggestVendorsOutput> {
  return suggestVendorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVendorsPrompt',
  input: {schema: SuggestVendorsInputSchema},
  output: {schema: SuggestVendorsOutputSchema},
  prompt: `You are a wedding planning assistant. Suggest vendors based on the following criteria:

Location: {{{location}}}
Vendor Type: {{{vendorType}}}
Budget: {{{budget}}}
Style: {{{style}}}
Additional Criteria: {{{additionalCriteria}}}

Suggest at least 3 vendors.`,
});

const suggestVendorsFlow = ai.defineFlow(
  {
    name: 'suggestVendorsFlow',
    inputSchema: SuggestVendorsInputSchema,
    outputSchema: SuggestVendorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
