import { Pool } from 'pg';
import { MemoryRow, MemoryWithTags } from '../../models/memory.model';

export class FocusedMemoryService {
  constructor(private pool: Pool) {}

  async getLimitedFocusedMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    const rows = await this.pool.query<MemoryRow & { tag_ids: string | null; tag_names: string | null }>(
      `
    SELECT 
      m.*, 
      string_agg(t.id::text, ',') AS tag_ids, 
      string_agg(t.name, ',') AS tag_names
    FROM memory_focus_rules fr
    JOIN focused_memories fm ON fr.id = fm.memory_focus_id
    JOIN memories m ON fm.memory_id = m.id
    LEFT JOIN memory_tags mt ON m.id = mt.memory_id
    LEFT JOIN tags t ON mt.tag_id = t.id
    WHERE fr.assistant_id = $1
    GROUP BY m.id
    ORDER BY m.created_at DESC
    LIMIT COALESCE((
      SELECT max_results 
      FROM memory_focus_rules 
      WHERE assistant_id = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    ), 10)  -- Ensure that the result respects maxResults
    `,
      [assistantId, assistantId]
    );

    return this.aggregateMemoriesWithTags(rows.rows);
  }

  async getAllFocusedMemoriesByRuleId(ruleId: string): Promise<MemoryWithTags[]> {
    const rows = await this.pool.query<MemoryRow & { tag_ids: string | null; tag_names: string | null }>(
      `
      SELECT 
        m.*, 
        string_agg(t.id::text, ',') AS tag_ids, 
        string_agg(t.name, ',') AS tag_names
      FROM focused_memories fm
      JOIN memories m ON fm.memory_id = m.id
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE fm.memory_focus_id = $1
      GROUP BY m.id
      ORDER BY m.created_at DESC
      `,
      [ruleId]
    );

    return this.aggregateMemoriesWithTags(rows.rows);
  }

  async addFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `
        INSERT INTO focused_memories (memory_focus_id, memory_id)
        VALUES ($1, $2)
      `,
        [memoryFocusId, memoryId]
      );

      if (!result.rowCount) return false;

      return result.rowCount > 0;
    } catch {
      return false;
    }
  }

  async removeFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `
        DELETE FROM focused_memories
        WHERE memory_focus_id = $1 AND memory_id = $2
      `,
        [memoryFocusId, memoryId]
      );
      if (!result.rowCount) return false;

      return result.rowCount > 0;
    } catch {
      return false;
    }
  }

  async updateFocusedMemories(memoryFocusId: string, memoryIds: string[]): Promise<boolean> {
    try {
      await this.pool.query(
        `
        DELETE FROM focused_memories
        WHERE memory_focus_id = $1
      `,
        [memoryFocusId]
      );

      const insertStmt = `
        INSERT INTO focused_memories (memory_focus_id, memory_id)
        VALUES ($1, $2)
      `;

      for (const memoryId of memoryIds) {
        await this.pool.query(insertStmt, [memoryFocusId, memoryId]);
      }
      return true;
    } catch {
      return false;
    }
  }

  private aggregateMemoriesWithTags(rows: (MemoryRow & { tag_ids: string | null; tag_names: string | null })[]): MemoryWithTags[] {
    return rows.map((row) => ({
      ...row,
      createdAt: new Date(row.created_at), // Updated to snake_case
      updatedAt: new Date(row.updated_at), // Updated to snake_case
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
