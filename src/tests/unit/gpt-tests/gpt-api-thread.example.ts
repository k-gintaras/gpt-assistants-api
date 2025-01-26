import { MessagesPage } from 'openai/resources/beta/threads/messages';
import { Run } from 'openai/resources/beta/threads/runs/runs';
import { getOpenAI } from '../../../services/gpt-api/gpt-api-connector';

/**
 * Adds a message to a thread.
 * @param threadId - The thread ID.
 * @param role - The role of the sender ('user' or 'assistant').
 * @param content - The message content.
 * @returns The message ID.
 */
export async function addMessage(threadId: string, role: 'user' | 'assistant', content: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const message = await openai.beta.threads.messages.create(threadId, { role, content });
    console.log(`Added ${role} message:`, message);
    return message.id;
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
}

/**
 *
 * @param threadId
 * @param assistantId
 * @returns runId: string | null
 */
export async function runAssistant(threadId: string, assistantId: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    console.log('Assistant Run:', run);
    return run.id;
  } catch (error) {
    console.error('Error running assistant:', error);
    return null;
  }
}

/**
 * Runs the assistant and waits for completion.
 * @param threadId - The thread ID.
 * @param assistantId - The assistant ID.
 * @param instructions - Optional instructions for this specific run.
 * @returns The completed run object.
 */
export async function runAssistantAndPoll(threadId: string, assistantId: string, instructions?: string): Promise<Run | null> {
  try {
    const openai = getOpenAI();
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
      instructions,
    });
    console.log('Run completed:', run);
    return run;
  } catch (error) {
    console.error('Error running assistant:', error);
    return null;
  }
}

/**
 * Retrieves all messages from a thread.
 * @param threadId - The thread ID.
 * @param limit - Maximum number of messages to retrieve.
 * @param order - Sort order ('asc' for oldest first, 'desc' for newest first).
 * @returns Array of messages or null if retrieval fails.
 */
export async function getAllMessages(threadId: string, limit = 50, order: 'asc' | 'desc' = 'asc'): Promise<MessagesPage | null> {
  try {
    const openai = getOpenAI();
    return await openai.beta.threads.messages.list(threadId, { limit, order });
  } catch (error) {
    console.error('Error retrieving all messages:', error);
    return null;
  }
}

/**
 * Extracts the assistant's response from a list of messages.
 * @param messages - The MessagesPage object containing all messages.
 * @returns The assistant's response as a string or null if not found.
 */
export function extractAssistantResponse(messages: MessagesPage): string | null {
  try {
    const assistantMessage = messages.data.find((msg) => msg.role === 'assistant');

    const contentBlock = assistantMessage?.content?.find((block) => block.type === 'text');
    if (contentBlock && 'text' in contentBlock) {
      return contentBlock.text.value;
    }

    console.warn('No assistant response found.');
    return null;
  } catch (error) {
    console.error('Error extracting assistant response:', error);
    return null;
  }
}

/**
 * Retrieves the assistant's response after a completed run.
 * @param threadId - The thread ID.
 * @returns The assistant's response as a string or null.
 */
export async function getAssistantResponse(threadId: string): Promise<string | null> {
  try {
    const messages = await getAllMessages(threadId, 50, 'asc');
    if (!messages) {
      console.warn('Failed to retrieve messages.');
      return null;
    }

    return extractAssistantResponse(messages);
  } catch (error) {
    console.error('Error getting assistant response:', error);
    return null;
  }
}

/**
 * Retrieves the details of a run, including its status and related information.
 * @param threadId - The ID of the thread the run belongs to.
 * @param runId - The ID of the run to retrieve.
 * @returns The details of the run, or null if retrieval fails.
 */
export async function getRunResults(threadId: string, runId: string): Promise<Run | null> {
  try {
    const openai = getOpenAI();

    // Retrieve the run details
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    // Log and return the status
    if (run.status === 'completed') {
      console.log('Run completed successfully:', run);
    } else {
      console.log(`Run status: ${run.status}`);
    }

    return run;
  } catch (error) {
    console.error(`Error retrieving run results for thread ${threadId} and run ${runId}:`, error);
    return null;
  }
}

/**
 * Retrieves the last assistant message from the thread.
 * @param threadId - The thread ID.
 * @returns The content of the last assistant message.
 */
export async function getLastAssistantMessage(threadId: string): Promise<MessagesPage | null> {
  try {
    const openai = getOpenAI();
    const messages = await openai.beta.threads.messages.list(threadId, { limit: 10, order: 'desc' });
    // const msgPage:MessagesPage={
    //     data: [],
    //     options: undefined,
    //     response: undefined,
    //     body: undefined,
    //     ...some other methods we don't care about
    // }

    // TODO TEST THIS< what are we getting even...
    return messages;
  } catch (error) {
    console.error('Error retrieving last assistant message:', error);
    return null;
  }
}

/**
 * Queries the assistant and retrieves a response.
 * @param assistantId - The assistant ID.
 * @param prompt - The user's prompt.
 * @returns The assistant's response as a string or null.
 */
export async function queryAssistant(assistantId: string, prompt: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const thread = await openai.beta.threads.create({
      // it is possible to have mini instructions here too: instructions:""
      metadata: {
        purpose: 'Direct Query',
        created_by: 'system',
      },
    });

    const threadId = thread.id;

    await openai.beta.threads.messages.create(threadId, { role: 'user', content: prompt });

    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    if (run?.status !== 'completed') {
      console.error('Assistant run did not complete.');
      return null;
    }

    const messages = await openai.beta.threads.messages.list(threadId, { limit: 1, order: 'desc' });

    const contentBlock = messages?.data?.[0]?.content?.[0];

    if (contentBlock?.type === 'text' && 'text' in contentBlock) {
      return contentBlock.text.value;
    }

    console.warn('Assistant response is not a text block.');
    return null;
  } catch (error) {
    console.error('Error querying assistant:', error);
    return null;
  }
}

/**
 * Adds multiple messages to a thread.
 * @param threadId - The thread ID.
 * @param messages - An array of messages with roles and content.
 * @returns Array of message IDs.
 */
export async function addMessages(threadId: string, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string[]> {
  try {
    const openai = getOpenAI();
    const messageIds: string[] = [];

    for (const msg of messages) {
      const message = await openai.beta.threads.messages.create(threadId, { role: msg.role, content: msg.content });
      messageIds.push(message.id);
    }

    return messageIds;
  } catch (error) {
    console.error('Error adding multiple messages:', error);
    return [];
  }
}

/**
 * Retrieves all messages in a thread.
 * @param threadId - The thread ID.
 * @param limit - The number of messages to retrieve.
 * @param order - The order of retrieval ('asc' or 'desc').
 * @returns An array of messages.
 */
export async function getMessages(threadId: string, limit = 10, order: 'asc' | 'desc' = 'desc'): Promise<MessagesPage | null> {
  try {
    const openai = getOpenAI();
    return await openai.beta.threads.messages.list(threadId, { limit, order });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return null;
  }
}

/**
 * Initializes a run for the assistant.
 * @param threadId - The thread ID.
 * @param assistantId - The assistant ID.
 * @returns The run ID.
 */
export async function initializeRun(threadId: string, assistantId: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
    return run.id;
  } catch (error) {
    console.error('Error initializing assistant run:', error);
    return null;
  }
}

/**
 * Polls for the status of a run.
 * @param threadId - The thread ID.
 * @param runId - The run ID.
 * @returns The completed run or null if it fails.
 */
export async function pollRunStatus(threadId: string, runId: string): Promise<Run | null> {
  try {
    const openai = getOpenAI();
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    return run?.status === 'completed' ? run : null;
  } catch (error) {
    console.error('Error polling run status:', error);
    return null;
  }
}

/**
 *
 * @param threadId
 * @param prompt
 * @returns messageId: string | null
 */
export async function addUserPrompt(threadId: string, prompt: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const message = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: prompt,
    });
    console.log('Added User Prompt:', message);
    return message.id;
  } catch (error) {
    console.error('Error adding user prompt:', error);
    return null;
  }
}

/**
 *
 * @param threadId
 * @param assistantId
 * @param prompt
 * @returns TODO: make it usable with return value and stuff
 */
export async function promptAssistant(threadId: string, assistantId: string, prompt: string) {
  // Step 1: Add the user's prompt to the thread
  const messageId = await addUserPrompt(threadId, prompt);
  if (!messageId) {
    console.error('Failed to add user prompt.');
    return;
  }

  // Step 2: Run the assistant to process the thread and generate a response
  const runId = await runAssistant(threadId, assistantId);
  if (!runId) {
    console.error('Failed to run assistant.');
    return;
  }

  console.log(`Assistant response generated for run ID: ${runId}`);
}

/**
 * Prompts the assistant and retrieves its response.
 * @param threadId - The thread ID.
 * @param assistantId - The assistant ID.
 * @param prompt - The user's prompt.
 * @param instructions - Optional instructions for the assistant.
 * @returns The assistant's response as a string.
 */
export async function promptAssistantSimple(threadId: string, assistantId: string, prompt: string, instructions?: string): Promise<string | null> {
  try {
    // Step 1: Add the user's prompt to the thread
    const messageId = await addMessage(threadId, 'user', prompt);
    if (!messageId) {
      console.error('Failed to add user message.');
      return null;
    }

    // Step 2: Run the assistant and wait for its response
    const run = await runAssistantAndPoll(threadId, assistantId, instructions);
    if (!run || run.status !== 'completed') {
      console.error('Assistant run did not complete.');
      return null;
    }

    // Step 3: Retrieve the assistant's last message
    const response = await getLastAssistantMessage(threadId);
    if (response) {
      console.log('Assistant Response:', response);
    } else {
      console.warn('No response found from assistant.');
    }

    console.log(response);
    // TODO: we have to test first, as we don't know what is this message object...

    return null;
  } catch (error) {
    console.error('Error prompting assistant:', error);
    return null;
  }
}
