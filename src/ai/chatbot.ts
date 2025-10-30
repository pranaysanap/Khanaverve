'use server';
import { ai } from './genkit';
import { z } from 'genkit';
import { vendors, locations } from '@/lib/data';

// Input schema
const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('User query about local tiffins or bhognalay options.'),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'bot']),
      content: z.string(),
    })
  ).optional(),
  context: z.string().optional(),
});
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

// Output schema
const AIChatbotAssistanceOutputSchema = z.object({
  reply: z.string().describe('AI chatbot reply.'),
});
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

// Extract relevant vendors/dishes/locations
function extractRelevantVendorsAndDishes(query: string) {
  const lcQuery = query.toLowerCase();
  const relevantLocations = locations.filter(loc => lcQuery.includes(loc.toLowerCase()));
  const relevantVendors = vendors.filter(vendor =>
    lcQuery.includes(vendor.name.toLowerCase()) ||
    (relevantLocations.length ? relevantLocations.includes(vendor.location) : false)
  );

  const relevantDishes: any[] = [];
  for (const vendor of relevantVendors) {
    relevantDishes.push(
      ...vendor.dishes.filter(dish => lcQuery.includes(dish.name.toLowerCase()))
    );
  }

  return { relevantLocations, relevantVendors, relevantDishes };
}

// Define prompt
const prompt = ai.definePrompt({
  name: 'aiChatbotAssistancePrompt',
  input: { schema: AIChatbotAssistanceInputSchema },
  output: { schema: AIChatbotAssistanceOutputSchema },
  prompt: `
You are Chotu — a friendly AI assistant for food and bhognalay recommendations.

Relevant Data:
{{context}}

User Query: {{{query}}}

Chat History:
{{#each chatHistory}}
  {{#if (eq role "user")}}User: {{{content}}}
  {{else}}Bot: {{{content}}}
  {{/if}}
{{/each}}
`,
});

// Define main function
export async function aiChatbotAssistance(
  input: AIChatbotAssistanceInput
): Promise<AIChatbotAssistanceOutput> {
  try {
    const hasApiKey = Boolean(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY);
    if (!hasApiKey) {
      return {
        reply: 'Chotu needs an API key to think. Please set GEMINI_API_KEY or GOOGLE_GENAI_API_KEY.',
      };
    }

    const { relevantLocations, relevantVendors, relevantDishes } =
      extractRelevantVendorsAndDishes(input.query);

    let contextText = '';

    if (relevantVendors.length > 0) {
      contextText += 'Vendor data:\n';
      for (const vendor of relevantVendors) {
        contextText += `- ${vendor.name} (${vendor.location}) cuisines: [${vendor.cuisine.join(
          ', '
        )}] rating: ${vendor.rating}\n  Dishes: ${vendor.dishes
          .map(d => `${d.name} (₹${d.price})`)
          .join(', ')}\n`;
      }
    }

    if (Array.isArray(relevantDishes) && relevantDishes.length > 0) {
      contextText += '\nFeatured dishes:\n';
      for (const dish of relevantDishes) {
        contextText += `- ${dish.name}: ${dish.description}, ₹${dish.price}\n`;
      }
    }

    if (!contextText && relevantLocations.length > 0) {
      contextText +=
        'Vendors in these locations: ' +
        relevantLocations
          .map(loc =>
            vendors.filter(v => v.location === loc).map(v => v.name).join(', ')
          )
          .join(', ') +
        '\n';
    }

    if (!contextText) {
      contextText = 'No direct matches found. Use general tiffin and bhognalay knowledge.';
    }

    const enrichedInput = { ...input, context: (input.context || '') + '\n' + contextText };

    // Retry logic
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await prompt(enrichedInput);
        if (res?.output?.reply) return res.output;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Chotu AI] Attempt ${attempt} failed:`, message);
        await new Promise(res => setTimeout(res, attempt * 300));
      }
    }

    return { reply: "I'm having trouble contacting the AI right now. Please try again." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Chotu AI] Unexpected error:', msg);
    return { reply: 'Oops, something went wrong. Please try again shortly.' };
  }
}

// Export flow
export const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AIChatbotAssistanceInputSchema,
    outputSchema: AIChatbotAssistanceOutputSchema,
  },
  async input => {
    const res = await prompt(input);
    return res.output!;
  }
);
