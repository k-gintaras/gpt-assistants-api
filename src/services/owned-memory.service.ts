import Database from 'better-sqlite3';
import { Memory, MemoryRow } from '../models/memory.model';
import { Tag } from '../models/tag.model';
import { transformMemoryRow } from '../transformers/memory.transformer';

export const ownedMemoryService = {
  db: new Database(':memory:'), // Default database instance

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  },
  async getMemoriesByAssistantId(assistantId: string): Promise<Memory[]> {
    const rows = this.db
      .prepare(
        `
      SELECT m.*, t.id AS tag_id, t.name AS tag_name
      FROM owned_memories om
      JOIN memories m ON om.memory_id = m.id
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE om.assistant_id = ?
    `
      )
      .all(assistantId) as (MemoryRow & { tag_id: string | null; tag_name: string | null })[];

    // Group tags by memory ID and transform memories
    const memoryMap = new Map<string, { row: MemoryRow; tags: Tag[] }>();

    rows.forEach((row) => {
      if (!memoryMap.has(row.id)) {
        memoryMap.set(row.id, { row, tags: [] });
      }
      if (row.tag_id && row.tag_name) {
        memoryMap.get(row.id)?.tags.push({ id: row.tag_id, name: row.tag_name });
      }
    });

    return Array.from(memoryMap.values()).map(({ row, tags }) => transformMemoryRow(row, tags));
  },
  async getOwnedMemories(assistantId: string): Promise<Memory[]> {
    const rows = this.db
      .prepare(
        `
      SELECT m.*, t.id AS tag_id, t.name AS tag_name
      FROM owned_memories om
      JOIN memories m ON om.memory_id = m.id
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE om.assistant_id = ?
    `
      )
      .all(assistantId) as (MemoryRow & { tag_id: string | null; tag_name: string | null })[];

    // Group tags by memory ID and transform memories
    const memoryMap = new Map<string, { row: MemoryRow; tags: Tag[] }>();

    rows.forEach((row) => {
      if (!memoryMap.has(row.id)) {
        memoryMap.set(row.id, { row, tags: [] });
      }
      if (row.tag_id && row.tag_name) {
        memoryMap.get(row.id)?.tags.push({ id: row.tag_id, name: row.tag_name });
      }
    });

    return Array.from(memoryMap.values()).map(({ row, tags }) => transformMemoryRow(row, tags));
  },

  async addOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
      INSERT INTO owned_memories (assistant_id, memory_id)
      VALUES (?, ?)
    `);

      const result = stmt.run(assistantId, memoryId);

      return result.changes > 0;
    } catch {
      return false;
    }
  },

  async removeOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
      DELETE FROM owned_memories
      WHERE assistant_id = ? AND memory_id = ?
    `);

      const result = stmt.run(assistantId, memoryId);

      return result.changes > 0;
    } catch {
      return false;
    }
  },

  async updateOwnedMemories(assistantId: string, memoryIds: string[]): Promise<boolean> {
    try {
      const deleteStmt = this.db.prepare(`
      DELETE FROM owned_memories
      WHERE assistant_id = ?
    `);

      const insertStmt = this.db.prepare(`
      INSERT INTO owned_memories (assistant_id, memory_id)
      VALUES (?, ?)
    `);

      // Remove all existing associations
      deleteStmt.run(assistantId);

      // Add the new set of memories
      for (const memoryId of memoryIds) {
        insertStmt.run(assistantId, memoryId);
      }
      return true;
    } catch {
      return false;
    }
  },
};
