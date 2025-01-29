import Database from 'better-sqlite3';
import { MemoryRow, MemoryWithTags } from '../../models/memory.model';
import { Tag } from '../../models/tag.model';

export class OwnedMemoryService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  /**
   * Fetch memories owned by a specific assistant, including associated tags.
   */
  async getMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
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

    return this.aggregateMemoriesWithTags(rows);
  }

  /**
   * Fetch all owned memories for a specific assistant.
   */
  async getOwnedMemories(assistantId: string): Promise<MemoryWithTags[]> {
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

    return this.aggregateMemoriesWithTags(rows);
  }

  /**
   * Add a memory to an assistant's owned memories.
   */
  async addOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO owned_memories (assistant_id, memory_id)
        VALUES (?, ?)
      `);
      const result = stmt.run(assistantId, memoryId);
      return result.changes > 0;
    } catch {
      return false; // Handle duplicates or constraint violations gracefully
    }
  }

  /**
   * Remove a memory from an assistant's owned memories.
   */
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
  }

  /**
   * Update the owned memories for a specific assistant.
   */
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
  }

  /**
   * Helper to aggregate memory rows and associated tags.
   */
  private aggregateMemoriesWithTags(rows: (MemoryRow & { tag_id: string | null; tag_name: string | null })[]): MemoryWithTags[] {
    const memoryMap = new Map<string, { row: MemoryRow; tags: Tag[] }>();

    rows.forEach((row) => {
      if (!memoryMap.has(row.id)) {
        memoryMap.set(row.id, { row, tags: [] });
      }
      if (row.tag_id && row.tag_name) {
        memoryMap.get(row.id)?.tags.push({ id: row.tag_id, name: row.tag_name });
      }
    });

    return Array.from(memoryMap.values()).map(({ row, tags }) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      tags: tags.length > 0 ? tags : null,
    }));
  }
}
