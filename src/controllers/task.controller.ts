import { Request, Response } from 'express';
import { TaskControllerService } from '../services/core-services/task.controller.service';
import Database from 'better-sqlite3';
import { Task } from '../models/task.model';
import { respond } from './controller.helper';

export class TaskController {
  private readonly taskControllerService: TaskControllerService;

  constructor(db: Database.Database) {
    this.taskControllerService = new TaskControllerService(db);
  }

  async getTaskById(req: Request, res: Response) {
    const { taskId } = req.params;
    try {
      const task = await this.taskControllerService.getTaskById(taskId);
      if (!task) {
        return respond(res, 404, `Task with ID ${taskId} not found.`);
      }
      return respond(res, 200, `Task with ID ${taskId} fetched successfully`, task);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve task.', null, error);
    }
  }

  async getAllTasks(req: Request, res: Response) {
    try {
      const tasks = await this.taskControllerService.getAllTasks();
      if (!tasks) {
        return respond(res, 404, `Tasks not found.`);
      }
      return respond(res, 200, 'Tasks fetched successfully', tasks);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve tasks.', null, error);
    }
  }

  async addTask(req: Request, res: Response) {
    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    try {
      const taskId = await this.taskControllerService.addTask(task);
      if (!taskId) {
        return respond(res, 400, `Task create failed.`);
      }
      return respond(res, 201, 'Task created successfully.', { id: taskId });
    } catch (error) {
      return respond(res, 500, 'Failed to create task.', null, error);
    }
  }

  async updateTask(req: Request, res: Response) {
    const { taskId } = req.params;
    const updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> = req.body;
    try {
      const isUpdated = await this.taskControllerService.updateTask(taskId, updates);
      if (!isUpdated) {
        return respond(res, 404, `Task with ID ${taskId} not found or update failed.`);
      }
      return respond(res, 200, 'Task updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update task.', null, error);
    }
  }

  async deleteTask(req: Request, res: Response) {
    const { taskId } = req.params;
    try {
      const isDeleted = await this.taskControllerService.deleteTask(taskId);
      if (!isDeleted) {
        return respond(res, 404, `Task with ID ${taskId} not found or delete failed.`);
      }
      return respond(res, 200, 'Task deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete task.', null, error);
    }
  }

  async getTasksByStatus(req: Request, res: Response) {
    const { status } = req.params;
    try {
      const tasks = await this.taskControllerService.getTasksByStatus(status as Task['status']);
      if (!tasks) {
        return respond(res, 404, `Tasks by status ${status} not found.`);
      }
      return respond(res, 200, `Tasks with status ${status} fetched successfully`, tasks);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve tasks by status.', null, error);
    }
  }

  async getTasksByAssistant(req: Request, res: Response) {
    const { assistantId } = req.params;
    try {
      const tasks = await this.taskControllerService.getTasksByAssistant(assistantId);
      if (!tasks) {
        return respond(res, 404, `Tasks by assistant id ${assistantId} not found.`);
      }
      return respond(res, 200, 'Tasks by assistant fetched successfully', tasks);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve tasks by assistant.', null, error);
    }
  }
}
