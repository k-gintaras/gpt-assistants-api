import Database from 'better-sqlite3';
import { Assistant } from '../../models/assistant.model';
import { AssistantService } from '../sqlite-services/assistant.service';
import { generateChatReply, GptMessage, GptMessageArray } from '../gpt-api/gpt-api-chat-completion';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';
import { Memory } from '../../models/memory.model';
import { MemoryTransformerService } from '../memory-transformer.service';
import { GptThreadMessage, GptThreadMessageArray, queryAssistantWithMessages } from '../gpt-api/gpt-api-thread';
import { TaskService } from '../sqlite-services/task.service';
import { MEMORY_TYPES_PASSED_AS_MESSAGES } from '../config.service';

export class PromptService {
  db: Database.Database;
  assistantService: AssistantService;
  memoryService: FocusedMemoryService;
  memoryTransformerService: MemoryTransformerService;
  taskService: TaskService;

  constructor(db: Database.Database) {
    this.db = db;
    this.assistantService = new AssistantService(this.db);
    this.memoryService = new FocusedMemoryService(this.db);
    this.memoryTransformerService = new MemoryTransformerService();
    this.taskService = new TaskService(this.db);
  }

  async prompt(id: string, prompt: string, extraInstruction?: string): Promise<string | null> {
    // Fetch the assistant first
    const assistant: Assistant | null = await this.assistantService.getAssistantById(id);
    if (!assistant) {
      // Return null directly if the assistant does not exist
      return null;
    }

    // Create a new task for the prompt
    const taskId = await this.taskService.addTask({
      description: `Prompt initiated: ${prompt}`,
      assignedAssistant: id,
      status: 'pending',
      inputData: JSON.stringify({ prompt, extraInstruction }),
      outputData: null,
    });

    try {
      let result: string | null;
      if (assistant.type === 'chat') {
        result = await this.handleChatPrompt(assistant, prompt, extraInstruction);
      } else {
        result = await this.handleAssistantPrompt(assistant, prompt, extraInstruction);
      }

      // Mark the task as completed and store the result
      await this.taskService.updateTask(taskId, {
        status: 'completed',
        outputData: JSON.stringify({ result }),
      });

      return result;
    } catch (error) {
      console.error('Error in prompt service:', error);

      // Mark the task as failed
      await this.taskService.updateTask(taskId, { status: 'failed' });
      return null;
    }
  }

  async handleChatPrompt(assistant: Assistant, prompt: string, extraInstruction?: string): Promise<string | null> {
    const model = assistant.model;
    const memories: Memory[] = await this.memoryService.getLimitedFocusedMemoriesByAssistantId(assistant.id);
    const messages: GptMessageArray = this.memoryTransformerService.getMessages(memories); // we pass all memories to chat

    // Add the user's prompt
    const userPrompt: GptMessage = {
      role: 'user',
      content: prompt,
    };
    messages.push(userPrompt);

    // Add extra instructions if provided
    if (extraInstruction) {
      const extra: GptMessage = {
        role: 'system',
        content: extraInstruction,
      };
      messages.push(extra);
    }

    // Generate chat reply
    return generateChatReply(model, messages);
  }

  async handleAssistantPrompt(assistant: Assistant, prompt: string, extraInstruction?: string): Promise<string | null> {
    const memories: Memory[] = await this.memoryService.getLimitedFocusedMemoriesByAssistantId(assistant.id);

    // instructions separate
    const messages: GptThreadMessageArray = this.memoryTransformerService.getThreadMessages(memories, { includeTypes: MEMORY_TYPES_PASSED_AS_MESSAGES });

    // Add the user's prompt
    const userPrompt: GptThreadMessage = {
      role: 'user',
      content: prompt,
    };
    messages.push(userPrompt);

    // Query the assistant with messages
    return extraInstruction ? queryAssistantWithMessages(assistant.id, messages, extraInstruction) : queryAssistantWithMessages(assistant.id, messages);
  }
}
