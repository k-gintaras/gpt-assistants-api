import { generateUniqueId } from './unique-id.service';
import { Tag } from '../../models/tag.model';
import { Pool } from 'pg';

export class TagService {
  constructor(private pool: Pool) {}

  async addTag(tag: Omit<Tag, 'id'>): Promise<string> {
    const id = generateUniqueId();

    const stmt = `
      INSERT INTO tags (id, name)
      VALUES ($1, $2)
    `;

    await this.pool.query(stmt, [id, tag.name]);

    return id;
  }

  async ensureTagExists(tagName: string): Promise<string> {
    const existingTagResult = await this.pool.query<{ id: string }>(`SELECT id FROM tags WHERE name = $1`, [tagName]);

    if (existingTagResult.rowCount && existingTagResult.rowCount > 0) {
      return existingTagResult.rows[0].id;
    }

    const newTagId = generateUniqueId();
    await this.pool.query(
      `
      INSERT INTO tags (id, name) VALUES ($1, $2)
    `,
      [newTagId, tagName]
    );

    return newTagId;
  }

  async removeTag(tagId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM tags WHERE id = $1', [tagId]);
    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Simplified return
  }

  async updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>): Promise<boolean> {
    const stmt = `
      UPDATE tags
      SET name = COALESCE($1, name)
      WHERE id = $2
    `;

    const result = await this.pool.query(stmt, [updates.name || null, id]);
    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Simplified return
  }

  async getTagById(tagId: string): Promise<Tag | null> {
    const result = await this.pool.query<Tag>('SELECT * FROM tags WHERE id = $1', [tagId]);
    if (result.rowCount === 0) return null; // Simplified condition
    return result.rows[0]; // Return the first row directly
  }

  async getAllTags(): Promise<Tag[]> {
    const result = await this.pool.query<Tag>('SELECT * FROM tags');
    return result.rows;
  }
}
