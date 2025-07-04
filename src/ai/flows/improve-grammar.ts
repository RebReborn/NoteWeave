// src/ai/flows/improve-grammar.ts
'use server';
/**
 * @fileOverview A flow that improves the grammar and clarity of a given text using an AI writing assistant.
 *
 * - improveGrammar - A function that accepts text and returns grammar-improved text.
 * - ImproveGrammarInput - The input type for the improveGrammar function.
 * - ImproveGrammarOutput - The return type for the improveGrammar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveGrammarInputSchema = z.object({
  text: z.string().describe('The text to improve the grammar and clarity of.'),
});
export type ImproveGrammarInput = z.infer<typeof ImproveGrammarInputSchema>;

const ImproveGrammarOutputSchema = z.object({
  improvedText: z.string().describe('The grammar-improved text.'),
});
export type ImproveGrammarOutput = z.infer<typeof ImproveGrammarOutputSchema>;

export async function improveGrammar(input: ImproveGrammarInput): Promise<ImproveGrammarOutput> {
  return improveGrammarFlow(input);
}

const improveGrammarPrompt = ai.definePrompt({
  name: 'improveGrammarPrompt',
  input: {schema: ImproveGrammarInputSchema},
  output: {schema: ImproveGrammarOutputSchema},
  prompt: `Improve the grammar and clarity of the following text:\n\n{{{text}}}`,
});

const improveGrammarFlow = ai.defineFlow(
  {
    name: 'improveGrammarFlow',
    inputSchema: ImproveGrammarInputSchema,
    outputSchema: ImproveGrammarOutputSchema,
  },
  async input => {
    const {output} = await improveGrammarPrompt(input);
    return output!;
  }
);
