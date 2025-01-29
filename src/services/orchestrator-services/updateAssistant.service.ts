import { AssistantService } from '../sqlite-services/assistant.service';
import { updateAssistant as updateGptAssistant } from '../gpt-api/gpt-api-assistant';
import { GptAssistantCreateRequest } from '../gpt-api/gpt-api-models.model';
import Database from 'better-sqlite3';
import { Assistant } from '../../models/assistant.model';
import { FullAssistantService } from '../sqlite-services/assistant-full.service';
import { MemoryTransformerService } from '../memory-transformer.service';

export class UpdateAssistantService {
  assistantService: AssistantService;
  assistantFullService: FullAssistantService;
  transformer: MemoryTransformerService;

  constructor(db: Database.Database) {
    this.assistantService = new AssistantService(db);
    this.assistantFullService = new FullAssistantService(db);
    this.transformer = new MemoryTransformerService();
  }

  async updateAssistant(id: string, updates: Partial<Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      // Step 1: Fetch the assistant with detailed information
      const existingAssistant = await this.assistantFullService.getFullAssistantWithDetailsEfficient(id);
      if (!existingAssistant) {
        console.error(`Assistant with ID ${id} not found.`);
        return false;
      }

      // Step 2: Prepare instructions from focused memories (if any)
      let instructions: string | null = null;
      if (existingAssistant.focusedMemories && existingAssistant.focusedMemories.length > 0) {
        instructions = this.transformer.getMemoriesToInstructions(existingAssistant.focusedMemories);
      }

      // Step 3: Update the assistant in the GPT API (if type is 'assistant')
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

      // Step 4: Update the assistant in the database
      const dbUpdateSuccess = await this.assistantService.updateAssistant(id, updates);
      if (!dbUpdateSuccess) {
        console.error(`Failed to update assistant in the database with ID ${id}.`);
        return false;
      }

      console.log(`Assistant with ID ${id} successfully updated.`);
      return true;
    } catch (error) {
      console.error(`Error updating assistant with ID ${id}:`, error);
      return false;
    }
  }
}
