import { Task } from '../../models/task.model';
import { TaskServiceModel } from '../../models/service-models/task.service.model';
import { Pool } from 'pg';
import { TaskService } from '../sqlite-services/task.service';

export class TaskControllerService implements TaskServiceModel {
  taskService: TaskService;

  constructor(pool: Pool) {
    this.taskService = new TaskService(pool);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return await this.taskService.getTaskById(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.taskService.getAllTasks();
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.taskService.addTask(task);
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    return await this.taskService.updateTask(id, updates);
  }

  async deleteTask(id: string): Promise<boolean> {
    return await this.taskService.deleteTask(id);
  }

  async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    return await this.taskService.getTasksByStatus(status);
  }

  async getTasksByAssistant(assistantId: string): Promise<Task[]> {
    return await this.taskService.getTasksByAssistant(assistantId);
  }
}
