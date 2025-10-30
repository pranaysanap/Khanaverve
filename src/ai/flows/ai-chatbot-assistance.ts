'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { vendors, locations } from '@/lib/data';

const AIChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The user query about local tiffin and bhognalay options.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'bot']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history of the conversation.'),
  context: z.string().optional(),
});
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

const AIChatbotAssistanceOutputSchema = z.object({
  reply: z.string().describe('The AI chatbot reply to the user query.'),
});
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

// 🧠 Extract local vendor/dish info
function extractRelevantVendorsAndDishes(query: string) {
  const lcQuery = query.toLowerCase();
  const relevantLocations = locations.filter((loc) => lcQuery.includes(loc.toLowerCase()));
  const relevantVendors = vendors.filter(
    (vendor) =>
      lcQuery.includes(vendor.name.toLowerCase()) ||
      (relevantLocations.length ? relevantLocations.includes(vendor.location) : false)
  );

  let relevantDishes: any[] = [];
  for (const vendor of relevantVendors) {
    relevantDishes.push(
      ...vendor.dishes.filter((dish) => lcQuery.includes(dish.name.toLowerCase()))
    );
  }
  return { relevantLocations, relevantVendors, relevantDishes };
}

export async function aiChatbotAssistance(
  input: AIChatbotAssistanceInput
): Promise<AIChatbotAssistanceOutput> {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Chotu AI] Missing GOOGLE_GENAI_API_KEY/GEMINI_API_KEY.');
      return {
        reply:
          '⚠️ Chotu needs an API key to think. Please set GEMINI_API_KEY (or GOOGLE_GENAI_API_KEY) and restart the server.',
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
          .map((d) => `${d.name} (₹${d.price})`)
          .join(', ')}\n`;
      }
    }
    if (relevantDishes.length > 0) {
      contextText += '\nFeatured dishes:\n';
      for (const dish of relevantDishes) {
        contextText += `- ${dish.name}: ${dish.description}, ₹${dish.price}\n`;
      }
    }
    if (!contextText && relevantLocations.length > 0) {
      contextText +=
        'Vendors in these locations: ' +
        relevantLocations
          .map((loc) => vendors.filter((v) => v.location === loc).map((v) => v.name).join(', '))
          .join(', ') +
        '\n';
    }

    // Enrich user context
    const enrichedInput = {
      ...input,
      context: (input.context || '') + (contextText ? `\n${contextText}` : ''),
    };

    // Define and run prompt dynamically
    const prompt = ai.definePrompt({
      name: 'aiChatbotAssistancePrompt',
      input: { schema: AIChatbotAssistanceInputSchema },
      output: { schema: AIChatbotAssistanceOutputSchema },
      prompt: `You are Chotu, a friendly AI chatbot helping users with food and tiffin queries.

Use the data below if relevant to answer accurately:
{{context}}

Current user query: "{{{query}}}"

Chat history:
{{#each chatHistory}}
  {{#if (eq role "user")}}
  User: {{{content}}}
  {{else}}
  Bot: {{{content}}}
  {{/if}}
{{/each}}

Answer concisely and clearly.`,
    });

    const { output } = await prompt(enrichedInput);
    return output ?? { reply: 'Sorry, I had trouble understanding your question.' };
  } catch (err: any) {
    console.error('[Chotu AI] Error:', err?.message || err);
    return { reply: '⚠️ Internal error occurred. Please try again later.' };
  }
}
