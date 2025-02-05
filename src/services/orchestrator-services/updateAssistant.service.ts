import { updateAssistant as updateGptAssistant } from '../gpt-api/gpt-api-assistant';
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
        console.error(`Assistant with ID ${id} not found.`);
        return false;
      }

      let instructions: string | null = null;
      if (existingAssistant.focusedMemories && existingAssistant.focusedMemories.length > 0) {
        instructions = this.transformer.getMemoriesToInstructions(existingAssistant.focusedMemories);
      }

      if (existingAssistant.type === 'assistant') {
        const gptUpdates: Partial<GptAssistantCreateRequest> = {
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.description ? { description: updates.description } : {}),
          ...(updates.model ? { model: updates.model } : {}),
          ...(instructions ? { instructions } : {}),
        };

        const gptUpdateSuccess = await updateGptAssistant(id, gptUpdates);
        if (!gptUpdateSuccess) {
          console.error(`Failed to update GPT assistant with ID ${id}.`);
          return false;
        }
      }

      const dbUpdateSuccess = await this.assistantService.updateAssistant(id, updates);
      if (!dbUpdateSuccess) {
        console.error(`Failed to update assistant in the database with ID ${id}.`);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error updating assistant with ID ${id}:`, error);
      return false;
    }
  }
}
