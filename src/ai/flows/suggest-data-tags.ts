'use server';

/**
 * @fileOverview A GenAI tool to automatically pre-tag new image submissions with brand/manufacturer information.
 *
 * - suggestDataTags - A function that handles the data tagging suggestion process.
 * - SuggestDataTagsInput - The input type for the suggestDataTags function.
 * - SuggestDataTagsOutput - The return type for the suggestDataTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDataTagsInputSchema = z.object({
  productImageUri: z
    .string()
    .describe(
      "A photo of the product focusing on the company logo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  recyclingImageUri: z
    .string()
    .optional()
    .describe(
      "A photo of the product's recycling information, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  manufacturerDetailsImageUri: z
    .string()
    .optional()
    .describe(
      "A photo of the product's manufacturer details, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional().describe("The location where the plastic was found."),
});
export type SuggestDataTagsInput = z.infer<typeof SuggestDataTagsInputSchema>;

const SuggestDataTagsOutputSchema = z.object({
  brand: z.string().describe('The suggested brand of the product.'),
  manufacturer: z.string().describe('The suggested manufacturer of the product.'),
  plasticType: z.string().optional().describe('The suggested plastic type of the product, if identifiable.'),
});
export type SuggestDataTagsOutput = z.infer<typeof SuggestDataTagsOutputSchema>;

export async function suggestDataTags(input: SuggestDataTagsInput): Promise<SuggestDataTagsOutput> {
  return suggestDataTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDataTagsPrompt',
  input: {schema: SuggestDataTagsInputSchema},
  output: {schema: SuggestDataTagsOutputSchema},
  prompt: `You are an expert in identifying brands, manufacturers, and plastic types from images of product packaging.

  Analyze the provided images to identify the brand, manufacturer, and plastic type of the product. Provide your best suggestions, and if information is not available, make educated guesses.
  {{#if location}}
  The item was found at latitude: {{location.latitude}}, longitude: {{location.longitude}}. Consider if this geographic context helps identify regional brands or manufacturers.
  {{/if}}

  Product Image: {{media url=productImageUri}}
  {{#if recyclingImageUri}}
  Recycling Information Image: {{media url=recyclingImageUri}}
  {{/if}}
  {{#if manufacturerDetailsImageUri}}
  Manufacturer Details Image: {{media url=manufacturerDetailsImageUri}}
  {{/if}}
  `,
});

const suggestDataTagsFlow = ai.defineFlow(
  {
    name: 'suggestDataTagsFlow',
    inputSchema: SuggestDataTagsInputSchema,
    outputSchema: SuggestDataTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
