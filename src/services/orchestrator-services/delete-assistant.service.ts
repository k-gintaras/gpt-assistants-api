import { Assistant } from '../../models/assistant.model';
// import { deleteAssistant as deleteGptAssistant } from '../gpt-api/gpt-api-assistant';
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

      // ! fix how assistant is deleted, because tasks are related to it... problematiiiic
      // ! we may want to keep tasks related and stuff but not want assistant
      // ! we may delete gpt assistant but then all them related tasks and querying might be confusing
      // ! just mark as "inactive_" for now...
      // Step 2: Delete from the database
      // const updateTasksStmt = this.assistantService.db.prepare(`
      //   UPDATE tasks SET assignedAssistant = NULL WHERE assignedAssistant = ?
      // `);
      // updateTasksStmt.run(id);

      // const sqlDelete = await this.assistantService.deleteAssistant(id);
      // if (!sqlDelete) {
      //   console.error(`Failed to delete assistant with ID ${id} from the database.`);
      //   return false;
      // }

      // // Step 3: If the assistant is of type 'assistant', delete from GPT API
      // if (assistant.type === 'assistant') {
      //   const gptDeleteResult = await deleteGptAssistant(id);
      //   if (!gptDeleteResult) {
      //     console.error(`Failed to delete GPT assistant with ID ${id}.`);
      //     return false;
      //   }
      // }

      // Mark as inactive instead of deleting
      await this.markAssistantAsInactive(id);

      // Optionally, you can also just "soft-delete" related data (tasks, memories) instead of reassigning it
      // await this.reassignOrMarkTasksAsInactive(id);

      console.log(`Successfully inactivated assistant with ID ${id}.`);
      return true;

      // console.log(`Successfully deleted assistant with ID ${id}.`);
      // return true;
    } catch (error) {
      console.error(`Error occurred while deleting assistant with ID ${id}:`, error);
      return false;
    }
  }

  // Mark assistant as inactive
  async markAssistantAsInactive(id: string): Promise<void> {
    const updateAssistantStmt = this.assistantService.db.prepare(`
    UPDATE assistants SET name = 'inactive_' || name, type = 'inactive' WHERE id = ?
  `);
    updateAssistantStmt.run(id);

    // Optionally: Update all tasks to reflect inactive assistant status
    const updateTasksStmt = this.assistantService.db.prepare(`
    UPDATE tasks SET assignedAssistant = 'inactive_' || assignedAssistant WHERE assignedAssistant = ?
  `);
    updateTasksStmt.run(id);
  }

  // Optionally reassign tasks or mark them as inactive
  async reassignOrMarkTasksAsInactive(id: string): Promise<void> {
    const updateTasksStmt = this.assistantService.db.prepare(`
    UPDATE tasks SET assignedAssistant = NULL, status = 'inactive' WHERE assignedAssistant = ?
  `);
    updateTasksStmt.run(id);
  }
}
