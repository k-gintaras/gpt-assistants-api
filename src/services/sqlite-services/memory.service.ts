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
      INSERT INTO memories (id, name, summary, type, description, data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await this.pool.query(stmt, [id, memory.name || null, memory.summary || null, memory.type, memory.description || null, memory.data || null, createdAt, updatedAt]);

    return id;
  }

  // Remove an existing memory
  async removeMemory(memoryId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM memories WHERE id = $1', [memoryId]);
    return (result.rowCount ?? 0) > 0; // ✅ Safe check for null
  }

  // Update an existing memory
  async updateMemory(id: string, updates: Partial<Omit<Memory, 'id' | 'tags' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const stmt = `
      UPDATE memories
      SET
        name = COALESCE($1, name),
        summary = COALESCE($2, summary),
        type = COALESCE($3, type),
        description = COALESCE($4, description),
        data = COALESCE($5, data),
        updated_at = $6
      WHERE id = $7
    `;

    const result = await this.pool.query(stmt, [updates.name || null, updates.summary || null, updates.type || null, updates.description || null, updates.data || null, new Date().toISOString(), id]);

    return (result.rowCount ?? 0) > 0; // ✅ Safe check for null
  }

  // Fetch memory by ID
  async getMemoryById(memoryId: string): Promise<Memory | null> {
    const result = await this.pool.query<MemoryRow>('SELECT * FROM memories WHERE id = $1', [memoryId]);
    if ((result.rowCount ?? 0) === 0) return null; // ✅ Safe check

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name || null,
      summary: row.summary || null,
      type: row.type,
      description: row.description || null,
      data: row.data || null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  // Fetch all memories
  async getAllMemories(): Promise<Memory[]> {
    const results = await this.pool.query<MemoryRow>('SELECT * FROM memories');
    return results.rows.map((row) => ({
      id: row.id,
      name: row.name || null,
      summary: row.summary || null,
      type: row.type,
      description: row.description || null,
      data: row.data || null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
}
