import { AssistantRow } from '../../models/assistant.model';
import { Pool } from 'pg';
import { AssistantService } from '../sqlite-services/assistant.service';

export class DeleteAssistantService {
  assistantService: AssistantService;

  constructor(private pool: Pool) {
    this.assistantService = new AssistantService(pool);
  }

  async deleteAssistant(id: string): Promise<boolean> {
    try {
      const assistant: AssistantRow | null = await this.assistantService.getAssistantById(id);
      if (!assistant) {
        console.log(`Assistant with ID ${id} does not exist. Nothing to delete.`);
        return true; // Nothing to delete
      }

      // Mark as inactive instead of deleting
      await this.markAssistantAsInactive(id);

      console.log(`Successfully inactivated assistant with ID ${id}.`);
      return true;
    } catch (error) {
      console.error(`Error occurred while deleting assistant with ID ${id}:`, error);
      return false;
    }
  }

  async markAssistantAsInactive(id: string): Promise<void> {
    const updateAssistantStmt = `
      UPDATE assistants SET name = 'inactive_' || name, type = 'inactive' WHERE id = $1
    `;
    await this.pool.query(updateAssistantStmt, [id]);

    // Update tasks to reflect inactive assistant status
    const updateTasksStmt = `
      UPDATE tasks SET assigned_assistant = 'inactive_' || assigned_assistant WHERE assigned_assistant = $1
    `;
    await this.pool.query(updateTasksStmt, [id]);
  }

  // Optionally reassign tasks or mark them as inactive
  async reassignOrMarkTasksAsInactive(id: string): Promise<void> {
    const updateTasksStmt = `
      UPDATE tasks SET assigned_assistant = NULL, status = 'inactive' WHERE assigned_assistant = $1
    `;
    await this.pool.query(updateTasksStmt, [id]);
  }
}
