import { Pool } from 'pg';
import { MemoryRow, MemoryWithTags } from '../../models/memory.model';
import { Tag } from '../../models/tag.model';

export class OwnedMemoryService {
  constructor(private pool: Pool) {}

  async getMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    const rows = await this.pool.query<MemoryRow & { tag_id: string | null; tag_name: string | null }>(
      `
      SELECT m.*, t.id AS tag_id, t.name AS tag_name
      FROM owned_memories om
      JOIN memories m ON om.memory_id = m.id
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE om.assistant_id = $1
      `,
      [assistantId]
    );

    return this.aggregateMemoriesWithTags(rows.rows);
  }

  async getOwnedMemories(assistantId: string): Promise<MemoryWithTags[]> {
    const rows = await this.pool.query<MemoryRow & { tag_id: string | null; tag_name: string | null }>(
      `
      SELECT m.*, t.id AS tag_id, t.name AS tag_name
      FROM owned_memories om
      JOIN memories m ON om.memory_id = m.id
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE om.assistant_id = $1
      `,
      [assistantId]
    );

    return this.aggregateMemoriesWithTags(rows.rows);
  }

  async addOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `
      INSERT INTO owned_memories (assistant_id, memory_id)
      VALUES ($1, $2)
      ON CONFLICT (assistant_id, memory_id) DO NOTHING
      `,
        [assistantId, memoryId]
      );
      if (!result.rowCount) return false;
      return result.rowCount > 0;
    } catch {
      return false;
    }
  }

  async removeOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `
        DELETE FROM owned_memories
        WHERE assistant_id = $1 AND memory_id = $2
      `,
        [assistantId, memoryId]
      );
      if (!result?.rowCount) return false;

      return result.rowCount > 0; // Simplified return
    } catch {
      return false;
    }
  }

  async updateOwnedMemories(assistantId: string, memoryIds: string[]): Promise<boolean> {
    try {
      await this.pool.query(
        `
        DELETE FROM owned_memories
        WHERE assistant_id = $1
      `,
        [assistantId]
      );

      const insertStmt = `
        INSERT INTO owned_memories (assistant_id, memory_id)
        VALUES ($1, $2)
      `;

      for (const memoryId of memoryIds) {
        await this.pool.query(insertStmt, [assistantId, memoryId]);
      }
      return true;
    } catch {
      return false;
    }
  }

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
      createdAt: new Date(row.created_at), // Updated to snake_case
      updatedAt: new Date(row.updated_at), // Updated to snake_case
      tags: tags.length > 0 ? tags : null,
    }));
  }
}
