'use server';

/**
 * @fileOverview Implements an AI-powered security analysis flow to identify potential threats in email content and attachments.
 *
 * @function analyzeEmailForSecurity - Analyzes email content and attachments for security threats.
 * @typedef {AnalyzeEmailInput} AnalyzeEmailInput - Input type for the security analysis flow.
 * @typedef {AnalyzeEmailOutput} AnalyzeEmailOutput - Output type for the security analysis flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmailInputSchema = z.object({
  content: z.string().describe('The content of the email.'),
  attachments: z
    .array(z.string())
    .describe(
      'Array of attachments encoded as data URIs, including MIME type and Base64 encoding (data:<mimetype>;base64,<encoded_data>).'
    )
    .optional(),
});

export type AnalyzeEmailInput = z.infer<typeof AnalyzeEmailInputSchema>;

const AnalyzeEmailOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the email is safe to send.'),
  reason: z
    .string()
    .describe('The reason for the safety determination, if applicable.')
    .optional(),
});

export type AnalyzeEmailOutput = z.infer<typeof AnalyzeEmailOutputSchema>;

export async function analyzeEmailForSecurity(
  input: AnalyzeEmailInput
): Promise<AnalyzeEmailOutput> {
  return analyzeEmailFlow(input);
}

const analyzeEmailPrompt = ai.definePrompt({
  name: 'analyzeEmailPrompt',
  input: {schema: AnalyzeEmailInputSchema},
  output: {schema: AnalyzeEmailOutputSchema},
  prompt: `You are a security expert analyzing an email for potential threats.

  Examine the content and attachments (if any) and determine if the email is safe to send.

  Content: {{{content}}}
  {{#if attachments}}
  Attachments:
    {{#each attachments}}
  - {{this}}
    {{/each}}
  {{/if}}

  Respond with whether the email is safe and provide a reason if it is not.
  Make sure that you only return a valid JSON and nothing else.
  `,
});

const analyzeEmailFlow = ai.defineFlow(
  {
    name: 'analyzeEmailFlow',
    inputSchema: AnalyzeEmailInputSchema,
    outputSchema: AnalyzeEmailOutputSchema,
  },
  async input => {
    const {output} = await analyzeEmailPrompt(input);
    return output!;
  }
);
