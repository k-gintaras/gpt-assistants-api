import Database from 'better-sqlite3';
import { Assistant } from '../../models/assistant.model';
import { Assistant as GptAssistant } from 'openai/resources/beta/assistants';

import { AssistantService } from '../sqlite-services/assistant.service';
import { createAssistant as createGptAssistant } from '../gpt-api/gpt-api-assistant';
import { GptAssistantCreateRequest } from '../gpt-api/gpt-api-models.model';
import { MemoryService } from '../sqlite-services/memory.service';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';
import { MemoryFocusRuleService } from '../sqlite-services/memory-focus-rule.service';
import { Memory } from '../../models/memory.model';
import { DEFAULT_MODEL, DEFAULT_INSTRUCTIONS, DEFAULT_MAX_ASSISTANT_MEMORIES } from '../config.service';

export class CreateAssistantService {
  assistantService: AssistantService;
  memoryService: MemoryService;
  focusMemoryService: FocusedMemoryService;
  memoryRulesService: MemoryFocusRuleService;
  constructor(db: Database.Database) {
    this.assistantService = new AssistantService(db);
    this.memoryService = new MemoryService(db);
    this.focusMemoryService = new FocusedMemoryService(db);
    this.memoryRulesService = new MemoryFocusRuleService(db);
  }

  async createSimpleAssistant(name: string, instructions: string) {
    return this.createAssistant(name, 'chat', instructions);
  }

  async createAssistant(name: string, type: Assistant['type'], model: string = DEFAULT_MODEL, instructions: string = DEFAULT_INSTRUCTIONS): Promise<string | null> {
    // Step 1: Check if the assistant already exists
    const existingAssistant = this.assistantService.getAssistantByName(name);
    if (existingAssistant) {
      console.log(`Assistant "${name}" already exists.`);
      return existingAssistant.id;
    }

    // Step 2: Create GPT Assistant if type is 'assistant'
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

    // Step 3: Create the assistant in the database
    // if no id, means we creating "chat" which has no id of gpt assistant need
    const assistantId = gptAssistantId || null;
    const assistant: Assistant = {
      name,
      description: '', // don't care now
      type,
      model,
      id: '', // ignored
      createdAt: '', // ignored
      updatedAt: '', // ignored
    };
    const id = await this.assistantService.addAssistant(assistant, assistantId);
    if (!id) return null;

    // Step 4: Register instructions as a memory
    if (instructions) {
      await this.registerInstructionMemory(id, instructions, DEFAULT_MAX_ASSISTANT_MEMORIES); // Default max memories
    }

    return id;
  }

  async registerInstructionMemory(assistantId: string, instructions: string, maxMemories: number): Promise<void> {
    // Step 1: Create a memory for instructions
    const memory: Memory = {
      id: '',
      type: 'instruction',
      description: instructions,
      data: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const memoryId = await this.memoryService.addMemory(memory);

    // Step 2: Create a focus rule
    const rule = await this.memoryRulesService.createMemoryFocusRule(assistantId, maxMemories);

    // Step 3: Link memory to the focus rule
    this.focusMemoryService.addFocusedMemory(rule.id, memoryId);
  }
}
