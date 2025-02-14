import { createGptAssistant, updateAssistant as updateGptAssistant } from '../gpt-api/gpt-api-assistant';
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

      if (this.checkIfUpgradeNeeded(existingAssistant, updates)) {
        return await this.processUpgrade(existingAssistant, updates, instructions);
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
    // If the assistant is not of type 'assistant', skip updating the GPT assistant
    if (existingAssistant.type !== 'assistant') {
      return await this.updateDatabase(existingAssistant.id, updates); // Only update the local database
    }

    // Prepare GPT update only if the assistant is of type 'assistant'
    const gptUpdates: Partial<GptAssistantCreateRequest> = {
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.description ? { description: updates.description } : {}),
      ...(updates.model ? { model: updates.model } : {}),
      ...(instructions ? { instructions } : {}),
    };

    // Ensure the GPT Assistant ID exists
    const gptAssistantId = existingAssistant.gptAssistantId;
    if (!gptAssistantId) {
      return false; // If no GPT assistant ID is present, return false
    }

    // Update the GPT assistant
    const gptUpdateSuccess = await updateGptAssistant(gptAssistantId, gptUpdates);
    if (!gptUpdateSuccess) {
      return false;
    }

    // If GPT update is successful, update the local assistant
    const dbUpdateSuccess = await this.updateDatabase(existingAssistant.id, updates);
    if (!dbUpdateSuccess) {
      return false;
    }

    return true; // Return true if both updates (GPT and local) are successful
  }

  // Update local assistant database
  async updateDatabase(id: string, updates: Partial<Assistant>): Promise<boolean> {
    const dbUpdateSuccess = await this.assistantService.updateAssistant(id, updates);
    if (!dbUpdateSuccess) {
      return false;
    }

    return true;
  }

  // Process upgrade
  async processUpgrade(existingAssistant: Assistant, updates: Partial<Assistant>, instructions: string | null): Promise<boolean> {
    const newGptAssistantId = await this.createNewAssistant(existingAssistant, instructions);
    if (!newGptAssistantId) return false;

    // Add the new `gptAssistantId` to the update
    updates.gptAssistantId = newGptAssistantId;

    // Update the local assistant with the new `gptAssistantId`
    return await this.updateDatabase(existingAssistant.id, updates);
  }
}
