import { Pool } from 'pg';
import { Memory, MemoryRow, MemoryWithTags } from '../../models/memory.model';
import { Tag } from '../../models/tag.model';
import { transformMemoryRow } from '../../transformers/memory.transformer';
import { generateUniqueId } from './unique-id.service';
import { MemoryService } from './memory.service';

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
    console.log('tags:', tags.join(','));
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

    console.log(result.rows);

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
}
