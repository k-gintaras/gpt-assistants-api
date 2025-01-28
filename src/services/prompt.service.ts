import Database from 'better-sqlite3';
import { Assistant } from '../models/assistant.model';
import { AssistantService } from './sqlite-services/assistant.service';
import { generateChatReply, GptMessage, GptMessageArray } from './gpt-api/gpt-api-chat-completion';
import { FocusedMemoryService } from './sqlite-services/focused-memory.service';
import { Memory } from '../models/memory.model';
import { MemoryTransformerService } from './memory-transformer.service';
import { GptThreadMessage, GptThreadMessageArray, queryAssistantWithMessages } from './gpt-api/gpt-api-thread';

export class PromptService {
  db: Database.Database;
  assistantService: AssistantService;
  memoryService: FocusedMemoryService;
  memoryTransformerService: MemoryTransformerService;

  constructor(db: Database.Database) {
    this.db = db;
    this.assistantService = new AssistantService(this.db);
    this.memoryService = new FocusedMemoryService(this.db);
    this.memoryTransformerService = new MemoryTransformerService();
  }

  async prompt(id: string, prompt: string, extraInstruction?: string): Promise<string | null> {
    // Fetch the assistant
    const assistant: Assistant | null = await this.assistantService.getAssistantById(id);
    if (!assistant) return null;

    // Handle based on assistant type
    if (assistant.type === 'chat') {
      // return this.handleChatPrompt(assistant, prompt, extraInstruction);
    } else {
      return this.handleAssistantPrompt(assistant, prompt, extraInstruction);
    }

    return 'null';
  }

  async handleChatPrompt(assistant: Assistant, prompt: string, extraInstruction?: string): Promise<string | null> {
    const model = assistant.model;
    const memories: Memory[] = await this.memoryService.getFocusedMemoriesByAssistantId(assistant.id);
    const messages: GptMessageArray = this.memoryTransformerService.getMessages(memories);

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
    // Prepare messages for thread-based assistant
    const memories: Memory[] = await this.memoryService.getFocusedMemoriesByAssistantId(assistant.id);
    const messages: GptThreadMessageArray = this.memoryTransformerService.getThreadMessages(memories);

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
