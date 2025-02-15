import { createGptAssistant, deleteGptAssistant, updateGptAssistant } from '../gpt-api/gpt-api-assistant';
import { GptAssistantCreateRequest } from '../gpt-api/gpt-api-models.model';
import { Pool } from 'pg';
import { Assistant } from '../../models/assistant.model';
import { MemoryTransformerService } from '../memory-transformer.service';
import { FullAssistantService } from '../sqlite-services/assistant-full.service';
import { AssistantService } from '../sqlite-services/assistant.service';

export class UpdateAssistantService {
  assistantService: AssistantService;
  assistantFullService: FullAssistantService;
  transformer: MemoryTransformerService;

  constructor(pool: Pool) {
    this.assistantService = new AssistantService(pool);
    this.assistantFullService = new FullAssistantService(pool);
    this.transformer = new MemoryTransformerService();
  }

  async updateAssistant(id: string, updates: Partial<Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      const existingAssistant = await this.assistantFullService.getFullAssistantWithDetailsEfficient(id);
      if (!existingAssistant) {
        return false;
      }

      let instructions: string | null = null;
      if (existingAssistant.focusedMemories && existingAssistant.focusedMemories.length > 0) {
        instructions = this.transformer.getMemoriesToInstructions(existingAssistant.focusedMemories);
      }

      // Check if upgrade or downgrade is needed
      if (this.checkIfUpgradeNeeded(existingAssistant, updates)) {
        return await this.processUpgrade(existingAssistant, updates, instructions);
      } else if (this.checkIfDowngradeNeeded(existingAssistant, updates)) {
        return await this.processDowngrade(existingAssistant, updates);
      }

      // Regular update
      return await this.updateGptAssistant(existingAssistant, updates, instructions);
    } catch {
      return false;
    }
  }

  // Check if upgrade is needed
  checkIfUpgradeNeeded(existingAssistant: Assistant, updates: Partial<Assistant>): boolean {
    return existingAssistant.type === 'chat' && updates.type === 'assistant';
  }

  // Check if downgrade is needed (from 'assistant' to 'chat')
  checkIfDowngradeNeeded(existingAssistant: Assistant, updates: Partial<Assistant>): boolean {
    return existingAssistant.type === 'assistant' && updates.type === 'chat';
  }

  // Process upgrade
  async processUpgrade(existingAssistant: Assistant, updates: Partial<Assistant>, instructions: string | null): Promise<boolean> {
    // Only create a new GPT assistant if there isn't already one
    if (!existingAssistant.gptAssistantId) {
      const newGptAssistantId = await this.createNewAssistant(existingAssistant, instructions);
      if (!newGptAssistantId) return false;
      updates.gptAssistantId = newGptAssistantId;
    }

    existingAssistant.name = `${existingAssistant.name}_Upgraded`;
    return await this.updateDatabase(existingAssistant.id, updates);
  }

  // Process downgrade
  async processDowngrade(existingAssistant: Assistant, updates: Partial<Assistant>): Promise<boolean> {
    if (existingAssistant.gptAssistantId) {
      // Only delete the GPT assistant if it exists
      const gptUpdateSuccess = await deleteGptAssistant(existingAssistant.gptAssistantId);
      if (!gptUpdateSuccess) {
        return false;
      }
    }

    updates.gptAssistantId = null;
    existingAssistant.name = `${existingAssistant.name}_Downgraded`;

    return await this.updateDatabase(existingAssistant.id, updates);
  }

  // Create a new GPT assistant for upgrading
  async createNewAssistant(existingAssistant: Assistant, instructions: string | null): Promise<string | null> {
    const gptPayload: GptAssistantCreateRequest = {
      model: existingAssistant.model,
      name: `${existingAssistant.name}_Upgraded`, // Add "_Upgraded" or similar suffix
      instructions: instructions || '',
    };

    const gptAssistant = await createGptAssistant(gptPayload);
    if (!gptAssistant) {
      return null;
    }

    return gptAssistant.id;
  }

  // Update GPT assistant (no upgrade)
  async updateGptAssistant(existingAssistant: Assistant, updates: Partial<Assistant>, instructions: string | null): Promise<boolean> {
    if (existingAssistant.type !== 'assistant') {
      return await this.updateDatabase(existingAssistant.id, updates); // Only update local database
    }

    const gptUpdates: Partial<GptAssistantCreateRequest> = {
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.description ? { description: updates.description } : {}),
      ...(updates.model ? { model: updates.model } : {}),
      ...(instructions ? { instructions } : {}),
    };

    const gptAssistantId = existingAssistant.gptAssistantId;
    if (!gptAssistantId) {
      return false;
    }

    const gptUpdateSuccess = await updateGptAssistant(gptAssistantId, gptUpdates);
    if (!gptUpdateSuccess) {
      return false;
    }

    const dbUpdateSuccess = await this.updateDatabase(existingAssistant.id, updates);
    return dbUpdateSuccess;
  }

  // Update local assistant database
  async updateDatabase(id: string, updates: Partial<Assistant>): Promise<boolean> {
    const dbUpdateSuccess = await this.assistantService.updateAssistant(id, updates);
    return dbUpdateSuccess;
  }
}
