import { Pool } from 'pg';
import { AssistantRow } from '../../models/assistant.model';
import { generateChatReply, GptMessageArray } from '../gpt-api/gpt-api-chat-completion';
import { Memory } from '../../models/memory.model';
import { MemoryTransformerService } from '../memory-transformer.service';
import { GptThreadMessage, GptThreadMessageArray, queryAssistantWithMessages, queryAssistantWithMessagesAndPrompt } from '../gpt-api/gpt-api-thread';
import { MEMORY_TYPES_PASSED_AS_MESSAGES } from '../config.service';
import { AssistantService } from '../sqlite-services/assistant.service';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';
import { TaskService } from '../sqlite-services/task.service';
import { estimateTokens, estimateTokensForResponse, models } from '../gpt-api/gpt-api-model-helper';

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

  // TODO: make this service cooler, allow prompt GROK, CLAUDE... shalalalal
  // TODO: return task id, so we can check the status of the task if this stuff fails or something,, otherwise we may wait this nonsense forever or... we cannopt have it logged for later checks...
  // if assistant.type="grok" "claude"... ???
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
      // TODO: assistant type= chat or assistant (use gpt api), assistant type= grok, claude (use grok api)
      // TODO: move prompt with delay to gpt api service
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

  async promptWithDelay(id: string, prompt: string, extraInstruction?: string): Promise<string | null> {
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
        result = await this.handleAssistantWithPrompt(assistant, prompt, extraInstruction);
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

  async handleChatPrompt(assistant: AssistantRow, prompt: string, extraInstruction?: string, responseSize: 'sentence' | 'paragraph' | 'page' | 'multi-page' = 'page'): Promise<string | null> {
    const model = assistant.model;
    const memories: Memory[] = await this.memoryService.getLimitedFocusedMemoriesByAssistantId(assistant.id);
    const messages: GptMessageArray = this.memoryTransformerService.getMessages(memories);

    const inputTokens = estimateTokens(prompt); // Estimate input token count
    const outputTokens = estimateTokensForResponse(inputTokens, responseSize).outputTokens; // Adjust based on response size

    // Ensure total tokens fit within model's context limit
    const modelData = models[model] || models['gpt-3.5-turbo'];
    const availableTokens = modelData.contextWindow - inputTokens;
    const maxTokens = Math.min(outputTokens, availableTokens, modelData.maxOutputTokens);

    messages.push({ role: 'user', content: prompt });

    if (extraInstruction) {
      messages.push({ role: 'system', content: extraInstruction });
    }

    return generateChatReply(model, messages, { max_tokens: maxTokens });
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

  async handleAssistantWithPrompt(assistant: AssistantRow, prompt: string, extraInstruction?: string): Promise<string | null> {
    // because instructions supposed to be on GPT api server
    // we don't want to include them in conversation - thread
    const memories: Memory[] = await this.memoryService.getLimitedFocusedMemoriesByAssistantIdNoInstructions(assistant.id);
    const messages: GptThreadMessageArray = this.memoryTransformerService.getThreadMessages(memories, { includeTypes: MEMORY_TYPES_PASSED_AS_MESSAGES });

    const userPrompt: GptThreadMessage = {
      role: 'user',
      content: prompt,
    };
    // messages.push(userPrompt);

    const id = assistant.gpt_assistant_id;
    if (!id) return null;
    return extraInstruction ? queryAssistantWithMessagesAndPrompt(id, messages, userPrompt, extraInstruction) : queryAssistantWithMessagesAndPrompt(id, messages, userPrompt);
  }
}
