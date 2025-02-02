import Database from 'better-sqlite3';
import { TaskService } from '../sqlite-services/task.service';
import { TagService } from '../sqlite-services/tag.service';
import { TagExtraService } from '../sqlite-services/tag-extra.service';
import { PromptService } from './prompt.service';
import { TaskRequest, TaskResponse } from '../../models/service-models/orchestrator.service.model';

export class TaskDelegationService {
  db: Database.Database;
  taskService: TaskService;
  tagService: TagService;
  tagExtraService: TagExtraService;
  promptService: PromptService;

  constructor(db: Database.Database) {
    this.db = db;
    this.taskService = new TaskService(db);
    this.tagService = new TagService(db);
    this.tagExtraService = new TagExtraService(db);
    this.promptService = new PromptService(db);
  }

  /**
   * Delegates a task to an assistant, optionally using PromptService.
   * @param assistantId - The assistant handling this task.
   * @param task - Task details (type, description, optional data).
   * @param tagNames - Optional tags for classification.
   * @param generatePrompt - If true, delegates task via PromptService.
   * @returns {Promise<TaskResponse>} The task response.
   */
  async delegateTask(assistantId: string, task: TaskRequest, tagNames?: string[]): Promise<TaskResponse> {
    try {
      // 🚀 If no prompt needed, manually create the task
      const taskId = await this.taskService.addTask({
        description: task.description,
        assignedAssistant: assistantId,
        status: 'pending',
        inputData: JSON.stringify(task),
        outputData: null,
      });

      // Assign tags if provided
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const tagId = await this.tagService.ensureTagExists(tagName);
          await this.tagExtraService.addTagToEntity(taskId, tagId, 'task');
        }
      }

      return {
        success: true,
        output: {
          taskId,
          assignedAssistant: assistantId,
          status: 'pending',
        },
      };
    } catch (error) {
      console.error('Error in delegateTask:', error);
      return { success: false, error: 'Failed to delegate task.' };
    }
  }
}
