import { Pool, PoolClient } from 'pg';
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

    if (existingTagResult.rowCount && existingTagResult.rowCount > 0) {
      return existingTagResult.rows[0].id; // Return the existing tag ID
    }

    // If no existing tag found, create a new one
    const newTagId = generateUniqueId();
    await this.pool.query(`INSERT INTO tags (id, name) VALUES ($1, $2)`, [newTagId, tagName]);

    return newTagId; // Return the new tag ID
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

  async addTagNamesToEntity(entityId: string, tags: string[], entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    const tableName = this.getTableNameForEntity(entityType);

    const client = await this.pool.connect(); // Start a client to manage the transaction

    try {
      await client.query('BEGIN'); // Begin transaction

      // Step 1: Ensure all tags exist (in parallel)
      const tagIds = await Promise.all(tags.map((tagName) => this.ensureTagExists2(tagName, client)));

      // Step 2: Insert tag-entity relationships (in parallel)
      const insertPromises = tagIds.map((tagId) => {
        const stmt = `
        INSERT INTO ${tableName} (${entityType}_id, tag_id)
        SELECT $1, $2
        WHERE NOT EXISTS (
          SELECT 1 FROM ${tableName} WHERE ${entityType}_id = $1 AND tag_id = $2
        )
      `;
        return client.query(stmt, [entityId, tagId]);
      });

      // Step 3: Wait for all insert operations to complete
      await Promise.all(insertPromises);

      await client.query('COMMIT'); // Commit transaction
      return true;
    } catch {
      await client.query('ROLLBACK'); // Rollback transaction if anything fails
      return false;
    } finally {
      client.release(); // Always release the client back to the pool
    }
  }

  async ensureTagExists2(tagName: string, client: PoolClient): Promise<string> {
    // Check if the tag exists in the tags table
    const existingTagResult = await client.query<{ id: string }>(`SELECT id FROM tags WHERE name = $1 LIMIT 1`, [tagName]);

    if (existingTagResult.rowCount && existingTagResult.rowCount > 0) {
      return existingTagResult.rows[0].id; // Return existing tag ID
    }

    // If tag doesn't exist, generate a new tag ID and insert it
    const newTagId = generateUniqueId();
    await client.query(`INSERT INTO tags (id, name) VALUES ($1, $2)`, [newTagId, tagName]);

    return newTagId; // Return the new tag ID
  }
}
