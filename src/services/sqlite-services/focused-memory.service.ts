import { Pool } from 'pg';
import { MemoryRow, MemoryWithTags } from '../../models/memory.model';

export class FocusedMemoryService {
  constructor(private pool: Pool) {}

  async getLimitedFocusedMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    // Step 1: fetch unique memory rows (no aggregation)
    const memRows = await this.pool.query<MemoryRow>(
      `
    SELECT 
      m.id, m.name, m.summary, m.type, m.description, m.data, m.created_at, m.updated_at
    FROM memory_focus_rules fr
    JOIN focused_memories fm ON fr.id = fm.memory_focus_id
    JOIN memories m ON fm.memory_id = m.id
    WHERE fr.assistant_id = $1
    `,
      [assistantId]
    );

    if (!memRows.rows.length) return [];

    // get desired limit from memory_focus_rules (fallback to 10)
    const maxRes = await this.pool.query(`SELECT max_results FROM memory_focus_rules WHERE assistant_id = $1 ORDER BY created_at DESC LIMIT 1`, [assistantId]);
    const limit = (maxRes.rows[0] && (maxRes.rows[0].max_results ?? maxRes.rows[0].max_results === 0 ? maxRes.rows[0].max_results : null)) ?? 10;

    // sort by freshest change in JS and apply limit
    const sorted = memRows.rows.sort((a, b) => {
      const aTime = Math.max(new Date(a.updated_at).getTime(), new Date(a.created_at).getTime());
      const bTime = Math.max(new Date(b.updated_at).getTime(), new Date(b.created_at).getTime());
      return bTime - aTime;
    });

    const sliced = sorted.slice(0, limit);

    // Step 2: fetch tags for these memories
    const ids = sliced.map((r) => r.id);
    const tagRows = await this.pool.query<{ memory_id: string; tag_id: string; tag_name: string }>(
      `SELECT mt.memory_id, t.id AS tag_id, t.name AS tag_name FROM memory_tags mt JOIN tags t ON mt.tag_id = t.id WHERE mt.memory_id = ANY($1)`,
      [ids]
    );

    const tagMap: Record<string, { id: string; name: string }[]> = {};
    for (const tr of tagRows.rows) {
      if (!tagMap[tr.memory_id]) tagMap[tr.memory_id] = [];
      tagMap[tr.memory_id].push({ id: tr.tag_id, name: tr.tag_name });
    }

    return sliced.map((row) => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: tagMap[row.id] && tagMap[row.id].length ? tagMap[row.id] : null,
    }));
  }

  async getLimitedFocusedMemoriesByAssistantIdNoInstructions(assistantId: string): Promise<MemoryWithTags[]> {
    const memRows = await this.pool.query<MemoryRow>(
      `
    SELECT 
      m.id, m.name, m.summary, m.type, m.description, m.data, m.created_at, m.updated_at
    FROM memory_focus_rules fr
    JOIN focused_memories fm ON fr.id = fm.memory_focus_id
    JOIN memories m ON fm.memory_id = m.id
    WHERE fr.assistant_id = $1
    AND m.type != 'instruction'
    `,
      [assistantId]
    );

    if (!memRows.rows.length) return [];

    const maxRes = await this.pool.query(`SELECT max_results FROM memory_focus_rules WHERE assistant_id = $1 ORDER BY created_at DESC LIMIT 1`, [assistantId]);
    const limit = (maxRes.rows[0] && (maxRes.rows[0].max_results ?? maxRes.rows[0].max_results === 0 ? maxRes.rows[0].max_results : null)) ?? 10;

    const sorted = memRows.rows.sort((a, b) => {
      const aTime = Math.max(new Date(a.updated_at).getTime(), new Date(a.created_at).getTime());
      const bTime = Math.max(new Date(b.updated_at).getTime(), new Date(b.created_at).getTime());
      return bTime - aTime;
    });

    const sliced = sorted.slice(0, limit);

    const ids = sliced.map((r) => r.id);
    const tagRows = await this.pool.query<{ memory_id: string; tag_id: string; tag_name: string }>(
      `SELECT mt.memory_id, t.id AS tag_id, t.name AS tag_name FROM memory_tags mt JOIN tags t ON mt.tag_id = t.id WHERE mt.memory_id = ANY($1)`,
      [ids]
    );

    const tagMap: Record<string, { id: string; name: string }[]> = {};
    for (const tr of tagRows.rows) {
      if (!tagMap[tr.memory_id]) tagMap[tr.memory_id] = [];
      tagMap[tr.memory_id].push({ id: tr.tag_id, name: tr.tag_name });
    }

    return sliced.map((row) => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: tagMap[row.id] && tagMap[row.id].length ? tagMap[row.id] : null,
    }));
  }

  async getAllFocusedMemoriesByRuleId(ruleId: string): Promise<MemoryWithTags[]> {
    const memRows = await this.pool.query<MemoryRow>(
      `
      SELECT 
        m.id, m.name, m.summary, m.type, m.description, m.data, m.created_at, m.updated_at
      FROM focused_memories fm
      JOIN memories m ON fm.memory_id = m.id
      WHERE fm.memory_focus_id = $1
      ORDER BY m.created_at DESC
      `,
      [ruleId]
    );

    if (!memRows.rows.length) return [];

    const ids = memRows.rows.map((r) => r.id);
    const tagRows = await this.pool.query<{ memory_id: string; tag_id: string; tag_name: string }>(
      `SELECT mt.memory_id, t.id AS tag_id, t.name AS tag_name FROM memory_tags mt JOIN tags t ON mt.tag_id = t.id WHERE mt.memory_id = ANY($1)`,
      [ids]
    );

    const tagMap: Record<string, { id: string; name: string }[]> = {};
    for (const tr of tagRows.rows) {
      if (!tagMap[tr.memory_id]) tagMap[tr.memory_id] = [];
      tagMap[tr.memory_id].push({ id: tr.tag_id, name: tr.tag_name });
    }

    return memRows.rows.map((row) => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      tags: tagMap[row.id] && tagMap[row.id].length ? tagMap[row.id] : null,
    }));
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
