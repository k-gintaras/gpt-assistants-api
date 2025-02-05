import { Pool } from 'pg';
import { Assistant } from '../../models/assistant.model';
import { Assistant as GptAssistant } from 'openai/resources/beta/assistants';
import { createAssistant as createGptAssistant } from '../gpt-api/gpt-api-assistant';
import { GptAssistantCreateRequest } from '../gpt-api/gpt-api-models.model';
import { Memory } from '../../models/memory.model';
import { DEFAULT_MODEL, DEFAULT_INSTRUCTIONS, DEFAULT_MAX_ASSISTANT_MEMORIES } from '../config.service';
import { AssistantService } from '../sqlite-services/assistant.service';
import { MemoryFocusRuleService } from '../sqlite-services/memory-focus-rule.service';
import { MemoryService } from '../sqlite-services/memory.service';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';

export class CreateAssistantService {
  assistantService: AssistantService;
  memoryService: MemoryService;
  focusMemoryService: FocusedMemoryService;
  memoryRulesService: MemoryFocusRuleService;

  constructor(pool: Pool) {
    this.assistantService = new AssistantService(pool);
    this.memoryService = new MemoryService(pool);
    this.focusMemoryService = new FocusedMemoryService(pool);
    this.memoryRulesService = new MemoryFocusRuleService(pool);
  }

  async createSimpleAssistant(name: string, instructions: string) {
    return this.createAssistant(name, 'chat', instructions);
  }

  async createAssistant(name: string, type: Assistant['type'], model: string = DEFAULT_MODEL, instructions: string = DEFAULT_INSTRUCTIONS): Promise<string | null> {
    const existingAssistant = await this.assistantService.getAssistantByName(name);
    if (existingAssistant) {
      console.log(`Assistant "${name}" already exists.`);
      return existingAssistant.id;
    }

    let gptAssistantId: string | null = null;
    if (type === 'assistant') {
      const gptPayload: GptAssistantCreateRequest = { model, name, instructions };
      const gptAssistant: GptAssistant | null = await createGptAssistant(gptPayload);

      if (!gptAssistant) {
        console.error('Failed to create GPT assistant.');
        return null;
      }

      gptAssistantId = gptAssistant.id;
    }

    const assistantId = gptAssistantId || null;
    const assistant: Assistant = {
      name,
      description: '',
      type,
      model,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    const id = await this.assistantService.addAssistant(assistant, assistantId);
    if (!id) return null;

    if (instructions) {
      await this.registerInstructionMemory(id, instructions, DEFAULT_MAX_ASSISTANT_MEMORIES);
    }

    return id;
  }

  async registerInstructionMemory(assistantId: string, instructions: string, maxMemories: number): Promise<void> {
    const memory: Memory = {
      id: '',
      type: 'instruction',
      description: instructions,
      data: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const memoryId = await this.memoryService.addMemory(memory);

    const rule = await this.memoryRulesService.createMemoryFocusRule(assistantId, maxMemories);

    await this.focusMemoryService.addFocusedMemory(rule.id, memoryId);
  }
}
