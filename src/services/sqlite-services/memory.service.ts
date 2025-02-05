import { Pool } from 'pg';
import { generateUniqueId } from './unique-id.service';
import { Memory, MemoryRow } from '../../models/memory.model';

export class MemoryService {
  constructor(protected pool: Pool) {}

  // Add a new memory
  async addMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = `
      INSERT INTO memories (id, type, description, data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await this.pool.query(stmt, [id, memory.type, memory.description || null, memory.data || null, createdAt, updatedAt]);

    return id;
  }

  // Remove an existing memory
  async removeMemory(memoryId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM memories WHERE id = $1', [memoryId]);
    if (!result.rowCount) return false;

    return result.rowCount > 0;
  }

  // Update an existing memory
  async updateMemory(id: string, updates: Partial<Omit<Memory, 'id' | 'tags' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const stmt = `
      UPDATE memories
      SET
        type = COALESCE($1, type),
        description = COALESCE($2, description),
        data = COALESCE($3, data),
        updated_at = $4
      WHERE id = $5
    `;

    const result = await this.pool.query(stmt, [updates.type || null, updates.description || null, updates.data || null, new Date().toISOString(), id]);
    if (!result.rowCount) return false;

    return result.rowCount > 0;
  }

  // Fetch memory by ID
  async getMemoryById(memoryId: string): Promise<Memory | null> {
    const result = await this.pool.query<MemoryRow>('SELECT * FROM memories WHERE id = $1', [memoryId]);
    if (result.rowCount === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      createdAt: new Date(row.created_at), // Updated to snake_case
      updatedAt: new Date(row.updated_at), // Updated to snake_case
    };
  }

  // Fetch all memories
  async getAllMemories(): Promise<Memory[]> {
    const results = await this.pool.query<MemoryRow>('SELECT * FROM memories');
    return results.rows.map((row) => ({
      ...row,
      createdAt: new Date(row.created_at), // Updated to snake_case
      updatedAt: new Date(row.updated_at), // Updated to snake_case
    }));
  }
}
