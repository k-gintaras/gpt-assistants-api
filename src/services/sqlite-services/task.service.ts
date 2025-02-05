import { Pool } from 'pg';
import { Task, TaskRow } from '../../models/task.model';
import { generateUniqueId } from './unique-id.service';

export class TaskService {
  constructor(private pool: Pool) {}

  async getTaskById(id: string): Promise<Task | null> {
    const result = await this.pool.query<TaskRow>('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) return null;

    return this.transformTaskRow(result.rows[0]);
  }

  async getAllTasks(): Promise<Task[]> {
    const result = await this.pool.query<TaskRow>('SELECT * FROM tasks');
    return result.rows.map(this.transformTaskRow);
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = `
    INSERT INTO tasks (id, description, assigned_assistant, status, input_data, output_data, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

    await this.pool.query(stmt, [
      id,
      task.description,
      task.assignedAssistant,
      task.status,
      task.inputData || null, // Directly pass the inputData object (not stringified)
      task.outputData || null,
      createdAt,
      updatedAt,
    ]);

    return id;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existingTaskResult = await this.pool.query<TaskRow>('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existingTaskResult.rowCount === 0) {
      throw new Error(`Task with ID ${id} not found.`);
    }

    const stmt = `
      UPDATE tasks
      SET
        description = COALESCE($1, description),
        assigned_assistant = COALESCE($2, assigned_assistant),
        status = COALESCE($3, status),
        input_data = COALESCE($4, input_data),
        output_data = COALESCE($5, output_data),
        updated_at = $6
      WHERE id = $7
    `;

    await this.pool.query(stmt, [
      updates.description || null,
      updates.assignedAssistant || null,
      updates.status || null,
      updates.inputData || null,
      updates.outputData || null,
      new Date().toISOString(),
      id,
    ]);

    return true;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Simplified return
  }

  async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    const result = await this.pool.query<TaskRow>('SELECT * FROM tasks WHERE status = $1', [status]);
    return result.rows.map(this.transformTaskRow);
  }

  async getTasksByAssistant(assistantId: string): Promise<Task[]> {
    const result = await this.pool.query<TaskRow>('SELECT * FROM tasks WHERE assigned_assistant = $1', [assistantId]);
    return result.rows.map(this.transformTaskRow);
  }

  private transformTaskRow(r: TaskRow): Task {
    return {
      id: r.id,
      description: r.description,
      assignedAssistant: r.assigned_assistant,
      inputData: r.input_data || null,
      outputData: r.output_data || null,
      status: r.status,
      createdAt: new Date(r.created_at), // Updated to snake_case
      updatedAt: new Date(r.updated_at), // Updated to snake_case
    };
  }
}
