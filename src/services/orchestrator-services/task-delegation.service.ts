import { Pool } from 'pg';
import { PromptService } from './prompt.service';
import { TaskRequest, TaskResponse } from '../../models/service-models/orchestrator.service.model';
import { TagExtraService } from '../sqlite-services/tag-extra.service';
import { TagService } from '../sqlite-services/tag.service';
import { TaskService } from '../sqlite-services/task.service';

export class TaskDelegationService {
  taskService: TaskService;
  tagService: TagService;
  tagExtraService: TagExtraService;
  promptService: PromptService;

  constructor(pool: Pool) {
    this.taskService = new TaskService(pool);
    this.tagService = new TagService(pool);
    this.tagExtraService = new TagExtraService(pool);
    this.promptService = new PromptService(pool);
  }

  async delegateTask(assistantId: string, task: TaskRequest, tagNames?: string[]): Promise<TaskResponse> {
    try {
      const taskId = await this.taskService.addTask({
        description: task.description,
        assignedAssistant: assistantId,
        status: 'pending',
        inputData: JSON.stringify(task),
        outputData: null,
      });

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
    } catch {
      return { success: false, error: 'Failed to delegate task.' };
    }
  }
}
