import { Pool } from 'pg';
import { MemoryTransformerService } from '../memory-transformer.service';
import { createNewThread, addThreadMessage, waitForRunCompletion, getAssistantReply, fetchThreadMessages } from '../gpt-api/gpt-api-thread';
import { AssistantService } from '../sqlite-services/assistant.service';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';
import { TaskService } from '../sqlite-services/task.service';

/**
 * Record for keeping track of thread information
 */
interface ThreadRecord {
  threadId: string;
  createdAt: Date;
  lastUsedAt: Date;
}

export class RefinedPromptService {
  private assistantService: AssistantService;
  private memoryService: FocusedMemoryService;
  private memoryTransformerService: MemoryTransformerService;
  private taskService: TaskService;

  // In-memory registry of assistant-to-thread mappings
  private threadRegistry: Map<string, ThreadRecord> = new Map();

  constructor(private pool: Pool) {
    this.assistantService = new AssistantService(pool);
    this.memoryService = new FocusedMemoryService(pool);
    this.memoryTransformerService = new MemoryTransformerService();
    this.taskService = new TaskService(pool);
  }

  /**
   * Initializes a thread for an assistant and adds context memories
   * @param assistantId - The ID of the assistant
   * @param forceNewThread - Whether to force creation of a new thread
   * @returns The thread ID or null if initialization fails
   */
  async initializeThread(assistantId: string, forceNewThread: boolean = false): Promise<string | null> {
    try {
      const assistant = await this.assistantService.getAssistantById(assistantId);
      if (!assistant) return null;

      // Use existing thread unless forcing new one
      if (!forceNewThread && this.threadRegistry.has(assistantId)) {
        const threadRecord = this.threadRegistry.get(assistantId)!;
        threadRecord.lastUsedAt = new Date();
        return threadRecord.threadId;
      }

      // Create a new thread
      const threadId = await createNewThread(`Assistant Thread: ${assistant.name || assistant.id}`, assistant.id);

      if (!threadId) throw new Error('Thread creation failed.');

      // Add context memories to the thread - these are non-instruction memories
      // that provide background knowledge for the assistant
      const contextMemories = await this.memoryService.getLimitedFocusedMemoriesByAssistantIdNoInstructions(assistant.id);

      if (contextMemories.length > 0) {
        for (const memory of contextMemories) {
          const formattedMemory = `[Context Memory: ${memory.type}] ${memory.description || JSON.stringify(memory.data) || ''}`;
          await addThreadMessage(threadId, 'user', formattedMemory);
        }
      }

      // Store thread in registry
      this.threadRegistry.set(assistantId, {
        threadId,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      });

      return threadId;
    } catch (error) {
      console.error('Error initializing thread:', error);
      return null;
    }
  }

  /**
   * Sends a prompt to an assistant using a persistent thread
   * @param assistantId - The ID of the assistant
   * @param prompt - The user's prompt
   * @param options - Optional configuration
   * @returns Object containing the response and thread ID
   */
  async promptAssistant(
    assistantId: string,
    prompt: string,
    options: {
      extraInstructions?: string;
      initializeIfNeeded?: boolean;
      forceNewThread?: boolean;
    } = {}
  ): Promise<{ response: string | null; threadId: string | null }> {
    try {
      const assistant = await this.assistantService.getAssistantById(assistantId);
      if (!assistant) return { response: null, threadId: null };

      // Handle thread initialization
      const initializeIfNeeded = options.initializeIfNeeded ?? true;
      let threadId: string | null = null;

      if (options.forceNewThread) {
        threadId = await this.initializeThread(assistantId, true);
      } else if (this.threadRegistry.has(assistantId)) {
        threadId = this.threadRegistry.get(assistantId)!.threadId;
      } else if (initializeIfNeeded) {
        threadId = await this.initializeThread(assistantId, false);
      }

      if (!threadId) return { response: null, threadId: null };

      // Create a task entry for tracking
      const taskId = await this.taskService.addTask({
        description: `Prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
        assignedAssistant: assistantId,
        status: 'in_progress',
        inputData: JSON.stringify({ prompt, threadId, options }),
        outputData: null,
      });

      try {
        // Add the user's prompt to the thread
        await addThreadMessage(threadId, 'user', prompt);

        // Get instruction-type memories to use as run instructions
        const instructionMemories = await this.memoryService.getLimitedFocusedMemoriesByAssistantId(assistant.id);
        const instructionText = instructionMemories
          .filter((memory) => memory.type === 'instruction')
          .map((memory) => memory.description || JSON.stringify(memory.data))
          .join('\n\n');

        // Combine with extra instructions if provided
        const finalInstructions = options.extraInstructions ? (instructionText ? `${instructionText}\n\n${options.extraInstructions}` : options.extraInstructions) : instructionText || undefined;

        // Run the assistant with instructions
        const gptAssistantId = assistant.gpt_assistant_id;
        if (!gptAssistantId) {
          throw new Error('Assistant has no GPT assistant ID');
        }

        const run = await waitForRunCompletion(threadId, gptAssistantId, finalInstructions);

        if (!run) throw new Error('Assistant run did not complete');

        // Get the assistant's reply
        const response = await getAssistantReply(threadId);

        // Update the task
        await this.taskService.updateTask(taskId, {
          status: 'completed',
          outputData: JSON.stringify({ response, threadId }),
        });

        // Update last used time in the registry
        if (this.threadRegistry.has(assistantId)) {
          this.threadRegistry.get(assistantId)!.lastUsedAt = new Date();
        }

        return { response, threadId };
      } catch (error) {
        console.error('Error in prompt execution:', error);
        await this.taskService.updateTask(taskId, { status: 'failed' });
        return { response: null, threadId };
      }
    } catch (error) {
      console.error('Error in promptAssistant:', error);
      return { response: null, threadId: null };
    }
  }

  /**
   * Main entry point: handle initialization and/or prompting in one call
   * @param assistantId - The ID of the assistant
   * @param prompt - The user's prompt
   * @param init - Whether to initialize a new thread (true) or use existing (false)
   * @param extraInstructions - Optional additional instructions
   * @returns Object containing response and thread ID
   */
  async prompt(assistantId: string, prompt: string, init: boolean = false, extraInstructions?: string): Promise<{ response: string | null; threadId: string | null }> {
    return this.promptAssistant(assistantId, prompt, {
      extraInstructions,
      forceNewThread: init,
    });
  }

  /**
   * Get the thread ID for an assistant if it exists
   * @param assistantId - The ID of the assistant
   * @returns The thread ID or null if no thread exists
   */
  getThreadId(assistantId: string): string | null {
    return this.threadRegistry.has(assistantId) ? this.threadRegistry.get(assistantId)!.threadId : null;
  }

  /**
   * Fetch the conversation history from a thread
   * @param assistantId - The ID of the assistant
   * @returns Array of messages in the thread or null if not found
   */
  async getConversationHistory(assistantId: string): Promise<Array<{ role: string; content: string }> | null> {
    const threadId = this.getThreadId(assistantId);
    if (!threadId) return null;

    try {
      const messagesPage = await fetchThreadMessages(threadId);
      if (!messagesPage) return null;

      // Convert messages to a simpler format
      return messagesPage.data.map((message) => {
        const content =
          message.content && message.content.length > 0 ? (message.content[0].type === 'text' && 'text' in message.content[0] ? message.content[0].text.value : JSON.stringify(message.content)) : '';

        return {
          role: message.role,
          content,
        };
      });
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return null;
    }
  }

  /**
   * Clear a thread for an assistant, removing it from the registry
   * @param assistantId - The ID of the assistant
   * @returns Success status
   */
  clearThread(assistantId: string): boolean {
    return this.threadRegistry.delete(assistantId);
  }

  /**
   * Clear all threads in the registry
   */
  clearAllThreads(): void {
    this.threadRegistry.clear();
  }
}
