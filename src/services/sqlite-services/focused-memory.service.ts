import Database from 'better-sqlite3';
import { MemoryRow, MemoryWithTags } from '../../models/memory.model';

export class FocusedMemoryService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  async getLimitedFocusedMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    const rows = this.db
      .prepare(
        `
      SELECT 
        m.*, 
        GROUP_CONCAT(t.id) AS tag_ids, 
        GROUP_CONCAT(t.name) AS tag_names
      FROM memory_focus_rules fr
      JOIN focused_memories fm ON fr.id = fm.memory_focus_id
      JOIN memories m ON fm.memory_id = m.id
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE fr.assistant_id = ?
      GROUP BY m.id
      ORDER BY m.createdAt DESC
      LIMIT COALESCE((SELECT maxResults FROM memory_focus_rules WHERE assistant_id = ?), 10)
      `
      )
      .all(assistantId, assistantId) as (MemoryRow & { tag_ids: string | null; tag_names: string | null })[];

    return this.aggregateMemoriesWithTags(rows);
  }

  /**
   * Fetch focused memories by focus ID, limited by the rule's maxResults, with associated tags.
   */
  async getAllFocusedMemoriesByRuleId(ruleId: string): Promise<MemoryWithTags[]> {
    const rows = this.db
      .prepare(
        `
      SELECT 
        m.*, 
        GROUP_CONCAT(t.id) AS tag_ids, 
        GROUP_CONCAT(t.name) AS tag_names
      FROM focused_memories fm
      JOIN memories m ON fm.memory_id = m.id
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE fm.memory_focus_id = ?
      GROUP BY m.id
      ORDER BY m.createdAt DESC
      `
      )
      .all(ruleId) as (MemoryRow & { tag_ids: string | null; tag_names: string | null })[];

    return this.aggregateMemoriesWithTags(rows);
  }

  /**
   * Add a memory to a focus group.
   */
  async addFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO focused_memories (memory_focus_id, memory_id)
        VALUES (?, ?)
      `);
      const result = stmt.run(memoryFocusId, memoryId);
      return result.changes > 0;
    } catch {
      return false; // Gracefully handle duplicates or constraint violations
    }
  }

  /**
   * Remove a memory from a focus group.
   */
  async removeFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM focused_memories
        WHERE memory_focus_id = ? AND memory_id = ?
      `);
      const result = stmt.run(memoryFocusId, memoryId);
      return result.changes > 0;
    } catch {
      return false;
    }
  }

  /**
   * Update focused memories for a focus group.
   */
  async updateFocusedMemories(memoryFocusId: string, memoryIds: string[]): Promise<boolean> {
    try {
      const deleteStmt = this.db.prepare(`
        DELETE FROM focused_memories
        WHERE memory_focus_id = ?
      `);

      const insertStmt = this.db.prepare(`
        INSERT INTO focused_memories (memory_focus_id, memory_id)
        VALUES (?, ?)
      `);

      // Remove all existing associations
      deleteStmt.run(memoryFocusId);

      // Add the new set of memories
      for (const memoryId of memoryIds) {
        insertStmt.run(memoryFocusId, memoryId);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper to aggregate memory rows and associated tags.
   */
  private aggregateMemoriesWithTags(rows: (MemoryRow & { tag_ids: string | null; tag_names: string | null })[]): MemoryWithTags[] {
    return rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      tags:
        row.tag_ids && row.tag_names
          ? row.tag_ids.split(',').map((id, index) => ({
              id,
              name: row.tag_names!.split(',')[index],
            }))
          : null,
    }));
  }
}
