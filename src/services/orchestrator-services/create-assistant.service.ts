import { Pool } from 'pg';
import { Assistant } from '../../models/assistant.model';
import { Assistant as GptAssistant } from 'openai/resources/beta/assistants';
import { createGptAssistant as createGptAssistant } from '../gpt-api/gpt-api-assistant';
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

  async createSimpleAssistant(name: string, instructions: string): Promise<string | null> {
    return this.createAssistant(name, 'Simple Assistant Basic Description', 'chat', DEFAULT_MODEL, instructions);
  }

  async createAssistant(name: string, description: string, type: Assistant['type'], model: string = DEFAULT_MODEL, instructions: string = DEFAULT_INSTRUCTIONS): Promise<string | null> {
    const existingAssistant = await this.assistantService.getAssistantByName(name);
    if (existingAssistant) {
      return existingAssistant.id;
    }

    let gptAssistantId: string | null = null;
    if (type === 'assistant') {
      const gptPayload: GptAssistantCreateRequest = { model, name, instructions };
      const gptAssistant: GptAssistant | null = await createGptAssistant(gptPayload);

      if (!gptAssistant) {
        return null;
      }

      gptAssistantId = gptAssistant.id;
    }

    const assistant: Assistant = {
      name,
      description: description,
      type,
      model,
      id: '', // Local assistant ID is empty on creation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gptAssistantId: gptAssistantId,
    };

    const id = await this.assistantService.addAssistant(assistant, gptAssistantId);
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
