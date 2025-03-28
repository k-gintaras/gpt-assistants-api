import { Pool } from 'pg';
import { Memory, MemoryRow, MemoryWithTags } from '../../models/memory.model';
import { Tag } from '../../models/tag.model';
import { transformBasicMemoryRow, transformMemoryRow } from '../../transformers/memory.transformer';
import { generateUniqueId } from './unique-id.service';
import { MemoryService } from './memory.service';

export interface OrganizedMemoriesResponse {
  looseMemories: Memory[];
  ownedMemories: { assistantId: string; memories: Memory[] }[];
  focusedMemories: { memoryFocusRuleId: string; memories: Memory[] }[];
}

export class MemoryExtraService extends MemoryService {
  constructor(protected pool: Pool) {
    super(pool);
  }

  async findDirectMemory(query: string): Promise<Memory | null> {
    try {
      const result = await this.pool.query<MemoryRow & { tag_ids: string | null; tag_names: string | null }>(
        `
      SELECT * 
      FROM memories 
      WHERE (data::text LIKE $1) OR (description LIKE $1)
      ORDER BY created_at DESC 
      LIMIT 1`,
        [`%${query}%`]
      );

      return result.rows.length > 0 ? transformMemoryRow(result.rows[0], []) : null;
    } catch {
      return null;
    }
  }

  async findMultipleMemories(query: string, limit = 3): Promise<string[]> {
    try {
      const result = await this.pool.query<MemoryRow & { tag_ids: string | null; tag_names: string | null }>(
        `
      SELECT * 
      FROM memories 
      WHERE (data::text LIKE $1) OR (description LIKE $1)  -- Cast JSONB to text for LIKE
      ORDER BY created_at DESC 
      LIMIT $2`,
        [`%${query}%`, limit]
      );

      return result.rows.map((mem) => (mem.data ? mem.data.toString() : '')); // Ensure data is converted to string if present
    } catch {
      return [];
    }
  }

  async getAllMemoriesWithTags(): Promise<MemoryWithTags[]> {
    const result = await this.pool.query<MemoryRow & { tag_id: string | null; tag_name: string | null }>(
      `
      SELECT m.*, t.id AS tag_id, t.name AS tag_name
      FROM memories m
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id`
    );

    const memoryMap = new Map<string, { row: MemoryRow; tags: Tag[] }>();

    result.rows.forEach((row) => {
      if (!memoryMap.has(row.id)) {
        memoryMap.set(row.id, { row, tags: [] });
      }
      if (row.tag_id && row.tag_name) {
        memoryMap.get(row.id)?.tags.push({ id: row.tag_id, name: row.tag_name });
      }
    });

    return Array.from(memoryMap.values()).map(({ row, tags }) => transformMemoryRow(row, tags));
  }

  async getMemoriesByTags(tags: string[]): Promise<MemoryWithTags[]> {
    if (tags.length === 0) {
      throw new Error('Tags array cannot be empty.');
    }

    const placeholders = tags.map((_, index) => `$${index + 1}`).join(', '); // Start from $1 for parameter placeholders
    const result = await this.pool.query<MemoryRow & { tag_id: string | null; tag_name: string | null }>(
      `
      SELECT m.*, t.id AS tag_id, t.name AS tag_name
      FROM memories m
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE t.name IN (${placeholders})`,
      tags
    );

    const memoryMap = new Map<string, { row: MemoryRow; tags: Tag[] }>();

    result.rows.forEach((row) => {
      if (!memoryMap.has(row.id)) {
        memoryMap.set(row.id, { row, tags: [] });
      }
      if (row.tag_id && row.tag_name) {
        memoryMap.get(row.id)?.tags.push({ id: row.tag_id, name: row.tag_name });
      }
    });

    return Array.from(memoryMap.values()).map(({ row, tags }) => transformMemoryRow(row, tags));
  }

  async updateMemoryTags(memoryId: string, newTagIds: string[]): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const memoryRes = await client.query(`SELECT * FROM memories WHERE id = $1`, [memoryId]);

      if (memoryRes.rows.length === 0) {
        return false;
      }

      const existingTagsRes = await client.query(`SELECT t.name FROM memory_tags mt JOIN tags t ON mt.tag_id = t.id WHERE mt.memory_id = $1`, [memoryId]);

      const currentTagNames = existingTagsRes.rows.map((tag) => tag.name);
      const tagsToAdd = newTagIds.filter((tagName) => !currentTagNames.includes(tagName));
      const tagsToRemove = currentTagNames.filter((tagName) => !newTagIds.includes(tagName));

      // Add new tags
      for (const tagName of tagsToAdd) {
        let tagRes = await client.query(`SELECT id FROM tags WHERE name = $1`, [tagName]);

        if (tagRes.rows.length === 0) {
          const newTagId = generateUniqueId();
          await client.query(`INSERT INTO tags (id, name) VALUES ($1, $2)`, [newTagId, tagName]);
          tagRes = await client.query(`SELECT id FROM tags WHERE name = $1`, [tagName]);
        }

        await client.query(`INSERT INTO memory_tags (memory_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [memoryId, tagRes.rows[0].id]);
      }

      // Remove old tags
      for (const tagName of tagsToRemove) {
        const tagRes = await client.query(`SELECT id FROM tags WHERE name = $1`, [tagName]);

        if (tagRes.rows.length > 0) {
          await client.query(`DELETE FROM memory_tags WHERE memory_id = $1 AND tag_id = $2`, [memoryId, tagRes.rows[0].id]);
        }
      }

      await client.query('COMMIT');
      return true;
    } catch {
      await client.query('ROLLBACK');
      return false;
    } finally {
      client.release();
    }
  }

  // TODO: write test getOrganizedMemories memory extra service
  async getOrganizedMemories(): Promise<OrganizedMemoriesResponse> {
    try {
      const result = await this.pool.query<
        MemoryRow & {
          assistant_id: string | null;
          memory_focus_id: string | null;
        }
      >(`
  SELECT 
    m.id AS id, 
    m.description, 
    m.type, 
    m.data,
    m.created_at, 
    m.updated_at,
    om.assistant_id, 
    fm.memory_focus_id
  FROM memories m
  LEFT JOIN owned_memories om ON m.id = om.memory_id
  LEFT JOIN focused_memories fm ON m.id = fm.memory_id;
`);

      // Initialize response structure
      const memoryResponse: OrganizedMemoriesResponse = {
        looseMemories: [],
        ownedMemories: [],
        focusedMemories: [],
      };

      // Temporary maps for grouping
      const ownedMap = new Map<string, Memory[]>();
      const focusedMap = new Map<string, Memory[]>();

      result.rows.forEach((row) => {
        const memory = transformBasicMemoryRow(row); // Using new transformer

        if (row.assistant_id && row.memory_focus_id) {
          if (!ownedMap.has(row.assistant_id)) ownedMap.set(row.assistant_id, []);
          ownedMap.get(row.assistant_id)!.push(memory);

          if (!focusedMap.has(row.memory_focus_id)) focusedMap.set(row.memory_focus_id, []);
          focusedMap.get(row.memory_focus_id)!.push(memory);
        } else if (row.assistant_id) {
          if (!ownedMap.has(row.assistant_id)) ownedMap.set(row.assistant_id, []);
          ownedMap.get(row.assistant_id)!.push(memory);
        } else if (row.memory_focus_id) {
          if (!focusedMap.has(row.memory_focus_id)) focusedMap.set(row.memory_focus_id, []);
          focusedMap.get(row.memory_focus_id)!.push(memory);
        } else {
          memoryResponse.looseMemories.push(memory);
        }
      });

      // Convert maps to arrays
      memoryResponse.ownedMemories = Array.from(ownedMap.entries()).map(([assistantId, memories]) => ({
        assistantId,
        memories,
      }));

      memoryResponse.focusedMemories = Array.from(focusedMap.entries()).map(([focusRuleId, memories]) => ({
        memoryFocusRuleId: focusRuleId,
        memories,
      }));

      return memoryResponse;
    } catch (error) {
      console.error('Error fetching and organizing memories:', error);
      return {
        looseMemories: [],
        ownedMemories: [],
        focusedMemories: [],
      };
    }
  }

  async forgetMemory(assistantId: string, memoryId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Step 1: Remove from owned_memories
      await client.query(`DELETE FROM owned_memories WHERE assistant_id = $1 AND memory_id = $2`, [assistantId, memoryId]);

      // Step 2: Delete from focused_memories based on assistant's focus rule
      await client.query(
        `
      DELETE FROM focused_memories 
      WHERE memory_id = $1 
      AND memory_focus_id = (
        SELECT id FROM memory_focus_rules WHERE assistant_id = $2
      )
      `,
        [memoryId, assistantId]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error forgetting memory:', error);
      return false;
    } finally {
      client.release();
    }
  }
}
