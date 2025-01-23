import { generateUniqueId } from './unique-id.service';
import { Memory } from '../models/memory.model';
import Database from 'better-sqlite3';

export const memoryService = {
  db: new Database(':memory:'), // Default database instance

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  },
  async addMemory(memory: Omit<Memory, 'id' | 'tags' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = this.db.prepare(`
    INSERT INTO memories (id, type,  description, data, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    stmt.run(id, memory.type, memory.description || null, memory.data ? JSON.stringify(memory.data) : null, createdAt, updatedAt);

    return id;
  },

  async removeMemory(memoryId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM memories WHERE id = ?');
    stmt.run(memoryId);
  },

  async updateMemory(id: string, updates: Partial<Omit<Memory, 'id' | 'tags' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const stmt = this.db.prepare(`
    UPDATE memories
    SET
      type = COALESCE(?, type),
      description = COALESCE(?, description),
      data = COALESCE(?, data),
      updatedAt = ?
    WHERE id = ?
  `);

    stmt.run(updates.type || null, updates.description || null, updates.data ? JSON.stringify(updates.data) : null, new Date().toISOString(), id);
  },
};
