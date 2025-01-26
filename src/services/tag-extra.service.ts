import Database from 'better-sqlite3';
import { Tag } from '../models/tag.model';

export const tagExtraService = {
  db: new Database(':memory:'),

  setDb(newDb: Database.Database) {
    this.db = newDb; // Override the database instance
  },

  // Fetch tags associated with an entity
  getTagsByEntity(entityId: string, entityType: 'memory' | 'assistant' | 'task'): Tag[] {
    const tableName = this.getTableNameForEntity(entityType);
    const stmt = this.db.prepare(`
      SELECT t.* 
      FROM ${tableName} et
      JOIN tags t ON et.tag_id = t.id
      WHERE et.${entityType}_id = ?
    `);
    return stmt.all(entityId) as Tag[];
  },

  // Associate a tag with an entity
  async addTagToEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    const tableName = this.getTableNameForEntity(entityType);

    const stmt = this.db.prepare(`
      INSERT INTO ${tableName} (${entityType}_id, tag_id)
      VALUES (?, ?)
    `);

    try {
      stmt.run(entityId, tagId);
      return true;
    } catch (error) {
      console.error('Error adding tag to entity:', error);
      return false;
    }
  },

  // Remove a tag from an entity
  async removeTagFromEntity(entityId: string, tagId: string, entityType: 'memory' | 'assistant' | 'task'): Promise<boolean> {
    const tableName = this.getTableNameForEntity(entityType);

    const stmt = this.db.prepare(`
      DELETE FROM ${tableName}
      WHERE ${entityType}_id = ? AND tag_id = ?
    `);

    const result = stmt.run(entityId, tagId);
    return result.changes > 0;
  },

  // Utility: Map entity type to table name
  getTableNameForEntity(entityType: 'memory' | 'assistant' | 'task'): string {
    const tableMap = {
      memory: 'memory_tags',
      assistant: 'assistant_tags',
      task: 'task_tags',
    };
    return tableMap[entityType];
  },
};
