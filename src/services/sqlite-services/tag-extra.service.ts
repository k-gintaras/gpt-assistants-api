import { Pool } from 'pg';
import { Tag } from '../../models/tag.model';

export class TagExtraService {
  constructor(private pool: Pool) {}

  async getTagsByEntity(entityId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<Tag[]> {
    const tableName = this.getTableNameForEntity(entityType);
    const result = await this.pool.query<Tag>(
      `
      SELECT t.* 
      FROM ${tableName} et
      JOIN tags t ON et.tag_id = t.id
      WHERE et.${entityType}_id = $1
    `,
      [entityId]
    );

    return result.rows;
  }

  async addTagToEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    const tableName = this.getTableNameForEntity(entityType);
    const stmt = `
    INSERT INTO ${tableName} (${entityType}_id, tag_id)
    VALUES ($1, $2)
  `;

    try {
      await this.pool.query(stmt, [entityId, tagId]);
      return true;
    } catch {
      return false;
    }
  }

  async removeTagFromEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    const tableName = this.getTableNameForEntity(entityType);

    const result = await this.pool.query(
      `
      DELETE FROM ${tableName}
      WHERE ${entityType}_id = $1 AND tag_id = $2
    `,
      [entityId, tagId]
    );
    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Simplified return
  }

  getTableNameForEntity(entityType: 'memory' | 'assistant' | 'task'): string {
    const tableMap = {
      memory: 'memory_tags',
      assistant: 'assistant_tags',
      task: 'task_tags',
    };
    return tableMap[entityType];
  }
}
