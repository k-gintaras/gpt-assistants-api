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

  // Fetch task by ID
  getTaskById(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const result = stmt.get(id) as TaskRow | undefined;

    if (!result) return null;

    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  // Fetch all tasks
  getAllTasks(): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks');
    const results = stmt.all() as TaskRow[];

    return results.map((result) => ({
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    }));
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

    stmt.run(
      id,
      task.description,
      task.assignedAssistant,
      task.status,
      task.inputData || null, // Save as a string
      task.outputData || null, // Save as a string
      createdAt,
      updatedAt
    );

    return id;
  }

  // Update an existing task
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existingTask = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;

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
      updates.inputData || null, // Save as a string
      updates.outputData || null, // Save as a string
      new Date().toISOString(),
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

    return result.changes > 0;
  }

  // Fetch tasks by status
  getTasksByStatus(status: Task['status']): Task[] {
    const stmt = this.db.prepare(`
      SELECT * 
      FROM tasks
      WHERE status = ?
    `);

    const results = stmt.all(status) as TaskRow[];

    return results.map((result) => ({
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    }));
  }

  // Fetch tasks assigned to a specific assistant
  getTasksByAssistant(assistantId: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT * 
      FROM tasks
      WHERE assignedAssistant = ?
    `);

    const results = stmt.all(assistantId) as TaskRow[];

    return results.map((result) => ({
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    }));
  }
}
