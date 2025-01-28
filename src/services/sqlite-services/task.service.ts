import Database from 'better-sqlite3';
import { Task, TaskRow } from '../../models/task.model';
import { generateUniqueId } from './unique-id.service';

export class TaskService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  // Fetch all tasks
  getTaskById(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const result = stmt.get(id) as TaskRow;

    if (!result) return null;

    return {
      ...result,
      inputData: result.inputData ? JSON.parse(result.inputData) : undefined,
      outputData: result.outputData ? JSON.parse(result.outputData) : undefined,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    } as Task;
  }

  getAllTasks(): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks');
    const results = stmt.all() as TaskRow[];

    return results.map((result) => ({
      ...result,
      inputData: result.inputData ? JSON.parse(result.inputData) : undefined,
      outputData: result.outputData ? JSON.parse(result.outputData) : undefined,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    })) as Task[];
  }
  // Add a new task
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId(); // Generate a unique ID for the task
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, description, assignedAssistant, status, inputData, outputData, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, task.description, task.assignedAssistant, task.status, JSON.stringify(task.inputData || null), JSON.stringify(task.outputData || null), createdAt, updatedAt);

    return id;
  }

  // Update an existing task
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existingTask = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;

    if (!existingTask) {
      throw new Error(`Task with ID ${id} not found.`);
    }

    const stmt = this.db.prepare(`
      UPDATE tasks
      SET
        description = COALESCE(?, description),
        assignedAssistant = COALESCE(?, assignedAssistant),
        status = COALESCE(?, status),
        inputData = COALESCE(?, inputData),
        outputData = COALESCE(?, outputData),
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.description || null,
      updates.assignedAssistant || null,
      updates.status || null,
      updates.inputData ? JSON.stringify(updates.inputData) : null,
      updates.outputData ? JSON.stringify(updates.outputData) : null,
      new Date().toISOString(), // updatedAt
      id
    );

    return true;
  }

  // Delete a task by ID
  async deleteTask(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM tasks
      WHERE id = ?
    `);

    const result = stmt.run(id);

    return result.changes > 0; // Returns true if the task was deleted
  }

  // Fetch tasks by status
  getTasksByStatus(status: Task['status']): Task[] {
    const stmt = this.db.prepare(`
      SELECT * 
      FROM tasks
      WHERE status = ?
    `);

    return stmt.all(status) as Task[];
  }

  // Fetch tasks assigned to a specific assistant
  getTasksByAssistant(assistantId: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT * 
      FROM tasks
      WHERE assignedAssistant = ?
    `);

    return stmt.all(assistantId) as Task[];
  }
}
