import { Task } from '../../models/task.model';
import { TaskServiceModel } from '../../models/service-models/task.service.model';
import { TaskService } from '../sqlite-services/task.service';
import Database from 'better-sqlite3';

export class TaskControllerService implements TaskServiceModel {
  taskService: TaskService;

  constructor(db: Database.Database) {
    this.taskService = new TaskService(db);
  }

  getTaskById(id: string): Task | null {
    return this.taskService.getTaskById(id);
  }

  getAllTasks(): Task[] {
    return this.taskService.getAllTasks();
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.taskService.addTask(task);
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    return this.taskService.updateTask(id, updates);
  }

  deleteTask(id: string): Promise<boolean> {
    return this.taskService.deleteTask(id);
  }

  getTasksByStatus(status: Task['status']): Task[] {
    return this.taskService.getTasksByStatus(status);
  }

  getTasksByAssistant(assistantId: string): Task[] {
    return this.taskService.getTasksByAssistant(assistantId);
  }
}
