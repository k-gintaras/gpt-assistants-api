import { Assistant } from '../../models/assistant.model';
import { deleteAssistant as deleteGptAssistant } from '../gpt-api/gpt-api-assistant';
import { AssistantService } from '../sqlite-services/assistant.service';
import Database from 'better-sqlite3';

export class DeleteAssistantService {
  assistantService: AssistantService;

  constructor(db: Database.Database) {
    this.assistantService = new AssistantService(db);
  }

  async deleteAssistant(id: string): Promise<boolean> {
    try {
      // Step 1: Check if the assistant exists
      const assistant: Assistant | null = await this.assistantService.getAssistantById(id);
      if (!assistant) {
        console.log(`Assistant with ID ${id} does not exist. Nothing to delete.`);
        return true; // Return true since there's nothing to delete
      }

      // Step 2: Delete from the database
      const sqlDelete = await this.assistantService.deleteAssistant(id);
      if (!sqlDelete) {
        console.error(`Failed to delete assistant with ID ${id} from the database.`);
        return false;
      }

      // Step 3: If the assistant is of type 'assistant', delete from GPT API
      if (assistant.type === 'assistant') {
        const gptDeleteResult = await deleteGptAssistant(id);
        if (!gptDeleteResult) {
          console.error(`Failed to delete GPT assistant with ID ${id}.`);
          return false;
        }
      }

      console.log(`Successfully deleted assistant with ID ${id}.`);
      return true;
    } catch (error) {
      console.error(`Error occurred while deleting assistant with ID ${id}:`, error);
      return false;
    }
  }
}
