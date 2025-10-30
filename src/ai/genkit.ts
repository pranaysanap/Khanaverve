'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Support multiple env var names, including user's NEXT_PUBLIC_GEMINI_API_KEY
const resolvedApiKey =
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!resolvedApiKey) {
  // eslint-disable-next-line no-console
  console.warn('[Chotu AI] Missing GOOGLE_GENAI_API_KEY / GEMINI_API_KEY / NEXT_PUBLIC_GEMINI_API_KEY.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: resolvedApiKey })],
  model: 'googleai/gemini-1.5-flash',
});
