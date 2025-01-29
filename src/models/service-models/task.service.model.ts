import { Task } from '../../models/task.model';

export interface TaskServiceModel {
  getTaskById(id: string): Task | null;
  getAllTasks(): Task[];
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean>;
  deleteTask(id: string): Promise<boolean>;
  getTasksByStatus(status: Task['status']): Task[];
  getTasksByAssistant(assistantId: string): Task[];
}
