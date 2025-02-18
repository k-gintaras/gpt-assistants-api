import { Pool } from 'pg';
import { AssistantRow } from '../../models/assistant.model';
import { generateChatReply, GptMessage, GptMessageArray } from '../gpt-api/gpt-api-chat-completion';
import { Memory } from '../../models/memory.model';
import { MemoryTransformerService } from '../memory-transformer.service';
import { GptThreadMessage, GptThreadMessageArray, queryAssistantWithMessages } from '../gpt-api/gpt-api-thread';
import { MEMORY_TYPES_PASSED_AS_MESSAGES } from '../config.service';
import { AssistantService } from '../sqlite-services/assistant.service';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';
import { TaskService } from '../sqlite-services/task.service';

export class PromptService {
  assistantService: AssistantService;
  memoryService: FocusedMemoryService;
  memoryTransformerService: MemoryTransformerService;
  taskService: TaskService;
  constructor(private pool: Pool) {
    this.assistantService = new AssistantService(pool);
    this.memoryService = new FocusedMemoryService(pool);
    this.memoryTransformerService = new MemoryTransformerService();
    this.taskService = new TaskService(pool);
  }

  async prompt(id: string, prompt: string, extraInstruction?: string): Promise<string | null> {
    const assistant: AssistantRow | null = await this.assistantService.getAssistantById(id);
    if (!assistant) {
      return null; // Assistant does not exist
    }

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

      await this.taskService.updateTask(taskId, {
        status: 'completed',
        outputData: JSON.stringify({ result }),
      });

      return result;
    } catch (error) {
      console.error('Error in prompt service:', error);
      await this.taskService.updateTask(taskId, { status: 'failed' });
      return null;
    }
  }

  async handleChatPrompt(assistant: AssistantRow, prompt: string, extraInstruction?: string): Promise<string | null> {
    const model = assistant.model;
    const memories: Memory[] = await this.memoryService.getLimitedFocusedMemoriesByAssistantId(assistant.id);
    const messages: GptMessageArray = this.memoryTransformerService.getMessages(memories);

    const userPrompt: GptMessage = {
      role: 'user',
      content: prompt,
    };
    messages.push(userPrompt);

    if (extraInstruction) {
      const extra: GptMessage = {
        role: 'system',
        content: extraInstruction,
      };
      messages.push(extra);
    }
    return generateChatReply(model, messages);
  }

  async handleAssistantPrompt(assistant: AssistantRow, prompt: string, extraInstruction?: string): Promise<string | null> {
    // because instructions supposed to be on GPT api server
    // we don't want to include them in conversation - thread
    const memories: Memory[] = await this.memoryService.getLimitedFocusedMemoriesByAssistantIdNoInstructions(assistant.id);
    const messages: GptThreadMessageArray = this.memoryTransformerService.getThreadMessages(memories, { includeTypes: MEMORY_TYPES_PASSED_AS_MESSAGES });

    const userPrompt: GptThreadMessage = {
      role: 'user',
      content: prompt,
    };
    messages.push(userPrompt);

    const id = assistant.gpt_assistant_id;
    if (!id) return null;
    return extraInstruction ? queryAssistantWithMessages(id, messages, extraInstruction) : queryAssistantWithMessages(id, messages);
  }
}
