// import OpenAI, { CreateThreadRequest, CreateMessageRequest } from 'openai';

import { MessagesPage } from 'openai/resources/beta/threads/messages';
import { getOpenAI } from './gpt-api-connector';
import { Run } from 'openai/resources/beta/threads/runs/runs';

export interface GptThreadMessage {
  role: 'user' | 'assistant';
  content: string;
}
export type GptThreadMessageArray = GptThreadMessage[];

/**
 * Creates a new thread for a specific purpose.
 * @param purpose - The purpose of the thread.
 * @param createdBy - The creator's identifier.
 * @returns The thread ID or null if creation fails.
 */
export async function createNewThread(purpose: string, createdBy: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const thread = await openai.beta.threads.create({
      metadata: { purpose, created_by: createdBy },
    });
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    return null;
  }
}

// MESSAGES:

/**
 * Adds a single message to a thread.
 * @param threadId - The thread ID.
 * @param role - The role of the message sender ('user' | 'assistant').
 * @param content - The content of the message.
 * @returns The message ID or null if addition fails.
 */
export async function addThreadMessage(threadId: string, role: 'user' | 'assistant', content: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const message = await openai.beta.threads.messages.create(threadId, { role, content });
    return message.id;
  } catch (error) {
    console.error('Error adding thread message:', error);
    return null;
  }
}

/**
 * Adds multiple messages to a thread.
 * @param threadId - The thread ID.
 * @param messages - Array of message objects with roles and content.
 * @returns Array of message IDs.
 */
export async function addMultipleMessages(threadId: string, messages: GptThreadMessageArray): Promise<string[]> {
  try {
    const openai = getOpenAI();
    const messageIds = await Promise.all(messages.map((msg) => openai.beta.threads.messages.create(threadId, msg).then((m) => m.id)));
    return messageIds;
  } catch (error) {
    console.error('Error adding multiple messages:', error);
    return [];
  }
}

/**
 * Adds multiple messages to a thread.
 * @param threadId - The thread ID.
 * @param messages - Array of message objects with roles and content.
 * @returns Array of message IDs.
 */
export async function addMultipleMessagesAndPrompt(threadId: string, messages: GptThreadMessageArray, prompt: GptThreadMessage): Promise<string[]> {
  try {
    const openai = getOpenAI();
    const messageIds = await Promise.all(messages.map((msg) => openai.beta.threads.messages.create(threadId, msg).then((m) => m.id)));

    // Add prompt message with a delay, because gpt API has 1 second delay between messages, if we insert all same time, they will all be same time
    // gpt therefore will reply to random one or all of them
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const promptMessageId = await openai.beta.threads.messages.create(threadId, prompt);
    messageIds.push(promptMessageId.id);

    return messageIds;
  } catch (error) {
    console.error('Error adding multiple messages:', error);
    return [];
  }
}

/**
 * Retrieves all messages from a thread.
 * @param threadId - The thread ID.
 * @param limit - The maximum number of messages to retrieve.
 * @param order - Sort order ('asc' | 'desc').
 * @returns MessagesPage object or null if retrieval fails.
 */
export async function fetchThreadMessages(threadId: string, limit = 50, order: 'asc' | 'desc' = 'asc'): Promise<MessagesPage | null> {
  try {
    const openai = getOpenAI();
    return await openai.beta.threads.messages.list(threadId, { limit, order });
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return null;
  }
}

// RUNS:

/**
 * Starts an assistant run on a thread.
 * @param threadId - The thread ID.
 * @param assistantId - The assistant ID.
 * @param instructions - Optional instructions for the assistant.
 * @returns The run ID or null if initialization fails.
 */
export async function startAssistantRun(threadId: string, assistantId: string, instructions?: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId, instructions });
    return run.id;
  } catch (error) {
    console.error('Error starting assistant run:', error);
    return null;
  }
}

/**
 * Polls and waits for the completion of an assistant run.
 * @param threadId - The thread ID.
 * @param assistantId - The assistant ID.
 * @param instructions - Optional instructions for the assistant.
 * @returns The completed run object or null if it fails.
 */
export async function waitForRunCompletion(threadId: string, assistantId: string, instructions?: string): Promise<Run | null> {
  try {
    const openai = getOpenAI();
    const run = await openai.beta.threads.runs.createAndPoll(threadId, { assistant_id: assistantId, instructions });
    return run.status === 'completed' ? run : null;
  } catch (error) {
    console.error('Error waiting for run completion:', error);
    return null;
  }
}

/**
 * Retrieves details of a specific run.
 * @param threadId - The thread ID.
 * @param runId - The run ID.
 * @returns The run object or null if retrieval fails.
 */
export async function getRunDetails(threadId: string, runId: string): Promise<Run | null> {
  try {
    const openai = getOpenAI();
    return await openai.beta.threads.runs.retrieve(threadId, runId);
  } catch (error) {
    console.error('Error fetching run details:', error);
    return null;
  }
}

// RESPONSE HELPERS:

/**
 * Extracts the assistant's response from a MessagesPage object.
 * @param messages - The MessagesPage object containing thread messages.
 * @returns The assistant's response as a string or null if not found.
 */
export function extractAssistantReply(messages: MessagesPage): string | null {
  try {
    const assistantMessage = messages.data.find((msg) => msg.role === 'assistant');
    const contentBlock = assistantMessage?.content?.find((block) => block.type === 'text');
    return contentBlock && 'text' in contentBlock ? contentBlock.text.value : null;
  } catch (error) {
    console.error('Error extracting assistant reply:', error);
    return null;
  }
}

/**
 * Retrieves the assistant's response for a completed run.
 * @param threadId - The thread ID.
 * @returns The assistant's response as a string or null.
 */
export async function getAssistantReply(threadId: string): Promise<string | null> {
  const messages = await fetchThreadMessages(threadId);
  return messages ? extractAssistantReply(messages) : null;
}

// SPECIALIZED
/**
 * Sends a prompt to the assistant and retrieves the response.
 * @param assistantId - The assistant ID.
 * @param prompt - The user's prompt.
 * @param instructions - Optional instructions for the assistant.
 * @returns The assistant's response as a string or null if any step fails.
 */
export async function queryAssistant(assistantId: string, prompt: string, instructions?: string): Promise<string | null> {
  try {
    const threadId = await createNewThread('Direct Query', 'system');
    if (!threadId) throw new Error('Thread creation failed.');

    const messageId = await addThreadMessage(threadId, 'user', prompt);
    if (!messageId) throw new Error('Failed to add user message.');

    const run = await waitForRunCompletion(threadId, assistantId, instructions);
    if (!run) throw new Error('Assistant run did not complete.');

    return getAssistantReply(threadId);
  } catch (error) {
    console.error('Error querying assistant:', error);
    return null;
  }
}

/**
 * Sends a prompt to the assistant and retrieves the response.
 * @param assistantId - The assistant ID.
 * @param prompt - The user's prompt.
 * @param instructions - Optional instructions for the assistant.
 * @returns The assistant's response as a string or null if any step fails.
 */
export async function queryAssistantWithMessages(assistantId: string, messages: GptThreadMessageArray, instructions?: string): Promise<string | null> {
  try {
    const threadId = await createNewThread('Direct Query', 'system');
    if (!threadId) throw new Error('Thread creation failed.');

    const messageId = await addMultipleMessages(threadId, messages);
    if (!messageId) throw new Error('Failed to add user message.');

    const run = await waitForRunCompletion(threadId, assistantId, instructions);
    if (!run) throw new Error('Assistant run did not complete.');

    return getAssistantReply(threadId);
  } catch (error) {
    console.error('Error querying assistant:', error);
    return null;
  }
}

/**
 * Sends a prompt to the assistant and retrieves the response.
 * @param assistantId - The assistant ID.
 * @param prompt - The user's prompt.
 * @param instructions - Optional instructions for the assistant. (just dont, these as gpt told me are same as gpt api assistant instructions, but overwritten)
 * @returns The assistant's response as a string or null if any step fails.
 */
export async function queryAssistantWithMessagesAndPrompt(assistantId: string, messages: GptThreadMessageArray, prompt: GptThreadMessage, instructions?: string): Promise<string | null> {
  try {
    const threadId = await createNewThread('Direct Query', 'system');
    if (!threadId) throw new Error('Thread creation failed.');

    const messageId = await addMultipleMessagesAndPrompt(threadId, messages, prompt);
    if (!messageId) throw new Error('Failed to add user message.');

    const run = await waitForRunCompletion(threadId, assistantId, instructions);
    if (!run) throw new Error('Assistant run did not complete.');

    return getAssistantReply(threadId);
  } catch (error) {
    console.error('Error querying assistant:', error);
    return null;
  }
}
