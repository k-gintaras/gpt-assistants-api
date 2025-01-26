import { ChatCompletion } from 'openai/resources';
import { getOpenAI } from './gpt-api-connector';

/**
 * Creates a chat completion using the provided messages and parameters.
 * @param model - The model to use for the chat completion (e.g., 'gpt-4o').
 * @param messages - Array of messages representing the conversation.
 * @param options - Additional configuration options for the completion.
 * @returns The chat completion response.
 */
export async function createChatCompletion(
  model: string,
  messages: Array<{ role: 'user' | 'developer' | 'assistant'; content: string }>,
  options: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    n?: number;
    stop?: string | string[];
    user?: string;
    store?: boolean;
  } = {}
): Promise<ChatCompletion | null> {
  try {
    const openai = getOpenAI();

    const response: ChatCompletion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: options.max_tokens ?? 100,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 1,
      n: options.n ?? 1,
      stop: options.stop ?? null,
      user: options.user ?? undefined,
      store: options.store ?? false,
    });

    return response;
  } catch (error) {
    console.error('Error creating chat completion:', error);
    return null;
  }
}
/**
 * Extracts the assistant's reply from the chat completion response.
 * @param completion - The chat completion response from the API.
 * @returns The assistant's reply or null if not available.
 */
export function extractChatReply(completion: ChatCompletion): string | null {
  try {
    const choice = completion.choices[0]?.message;
    return choice?.content?.trim() ?? null;
  } catch (error) {
    console.error('Error extracting chat reply:', error);
    return null;
  }
}

/**
 * Generates a chat completion for the given conversation.
 * @param model - The model to use for the chat completion (e.g., 'gpt-4o').
 * @param messages - Array of messages representing the conversation.
 * @param options - Additional configuration options for the completion.
 * @returns The assistant's reply as a string or null if the completion fails.
 */
export async function generateChatReply(
  model: string,
  messages: Array<{ role: 'user' | 'developer' | 'assistant'; content: string }>,
  options: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    stop?: string | string[];
    user?: string;
    store?: boolean;
  } = {}
): Promise<string | null> {
  const completion = await createChatCompletion(model, messages, options);
  return completion ? extractChatReply(completion) : null;
}

/**
 * Extends a conversation with new messages.
 * @param history - The conversation history as an array of messages.
 * @param newMessages - New messages to add to the conversation.
 * @returns The updated conversation history.
 */
export function extendConversation(
  history: Array<{ role: 'user' | 'developer' | 'assistant'; content: string }>,
  newMessages: Array<{ role: 'user' | 'developer' | 'assistant'; content: string }>
): Array<{ role: 'user' | 'developer' | 'assistant'; content: string }> {
  return [...history, ...newMessages];
}
