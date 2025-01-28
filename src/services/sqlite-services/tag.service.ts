import { generateUniqueId } from './unique-id.service';
import { Tag } from '../../models/tag.model';
import Database from 'better-sqlite3';

export class TagService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  /**
   * Add a new tag.
   */
  async addTag(tag: Omit<Tag, 'id'>): Promise<string> {
    const id = generateUniqueId();

    const stmt = this.db.prepare(`
      INSERT INTO tags (id, name)
      VALUES (?, ?)
    `);

    stmt.run(id, tag.name);

    return id;
  }

  /**
   * Remove a tag by ID.
   */
  async removeTag(tagId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM tags WHERE id = ?');
    stmt.run(tagId);
  }
  /**
   * Update an existing tag.
   */
  async updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE tags
      SET name = COALESCE(?, name)
      WHERE id = ?
    `);

    stmt.run(updates.name || null, id);
  }

  /**
   * Fetch a tag by ID.
   */
  async getTagById(tagId: string): Promise<Tag | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM tags WHERE id = ?
    `);

    const result = stmt.get(tagId);
    return result ? (result as Tag) : null;
  }

  /**
   * Fetch all tags.
   */
  async getAllTags(): Promise<Tag[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM tags
    `);

    return stmt.all() as Tag[];
  }
}
