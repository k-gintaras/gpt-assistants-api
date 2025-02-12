import { Pool } from 'pg';
import { Tag } from '../../models/tag.model';
import { generateUniqueId } from './unique-id.service';

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

  async addTagNameToEntity(entityId: string, tagName: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    const tableName = this.getTableNameForEntity(entityType);

    // Ensure the tag exists and get the tag ID
    const tagId = await this.ensureTagExists(tagName);

    // Insert the tag ID and entity ID into the correct table
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

  /**
   * ! i know i know, tag service already has it, but i didn't want to inject it here and cause chaos
   */
  async ensureTagExists(tagName: string): Promise<string> {
    const existingTagResult = await this.pool.query<{ id: string }>(`SELECT id FROM tags WHERE name = $1`, [tagName]);

    // Check if rowCount is valid and if there are any rows returned
    if (existingTagResult.rowCount && existingTagResult.rowCount > 0) {
      return existingTagResult.rows[0].id;
    }

    // If no existing tag found, create a new one
    const newTagId = generateUniqueId();
    await this.pool.query(`INSERT INTO tags (id, name) VALUES ($1, $2)`, [newTagId, tagName]);

    return newTagId;
  }

  async addTagNamesToEntity(entityId: string, tags: string[], entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    // Make sure tags are unique to avoid duplicate insertions
    const uniqueTags = [...new Set(tags)];

    // Loop through each tag and add it to the entity
    for (const tag of uniqueTags) {
      const result = await this.addTagNameToEntity(entityId, tag, entityType);
      if (!result) {
        return false; // If any tag addition fails, return false
      }
    }

    return true; // All tags were added successfully
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
