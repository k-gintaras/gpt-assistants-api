import Database from 'better-sqlite3';
import { Memory, MemoryRow } from '../../models/memory.model';
import { Tag } from '../../models/tag.model';
import { transformMemoryRow } from '../../transformers/memory.transformer';
import { generateUniqueId } from './unique-id.service';

export class MemoryExtraService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }
  /**
   * Fetch all memories with their associated tags.
   */
  async getAllMemories(): Promise<Memory[]> {
    const rows = this.db
      .prepare(
        `
        SELECT m.*, t.id AS tag_id, t.name AS tag_name
        FROM memories m
        LEFT JOIN memory_tags mt ON m.id = mt.memory_id
        LEFT JOIN tags t ON mt.tag_id = t.id
      `
      )
      .all() as (MemoryRow & { tag_id: string | null; tag_name: string | null })[];

    // Group tags by memory ID and transform memories
    const memoryMap = new Map<string, { row: MemoryRow; tags: Tag[] }>();

    rows.forEach((row) => {
      if (!memoryMap.has(row.id)) {
        memoryMap.set(row.id, { row, tags: [] });
      }
      if (row.tag_id && row.tag_name) {
        memoryMap.get(row.id)?.tags.push({ id: row.tag_id, name: row.tag_name });
      }
    });

    return Array.from(memoryMap.values()).map(({ row, tags }) => transformMemoryRow(row, tags));
  }

  /**
   * Fetch memories associated with specific tags.
   */
  async getMemoriesByTags(tags: string[]): Promise<Memory[]> {
    if (tags.length === 0) {
      throw new Error('Tags array cannot be empty.');
    }

    const placeholders = tags.map(() => '?').join(', ');
    const rows = this.db
      .prepare(
        `
        SELECT m.*, t.id AS tag_id, t.name AS tag_name
        FROM memories m
        LEFT JOIN memory_tags mt ON m.id = mt.memory_id
        LEFT JOIN tags t ON mt.tag_id = t.id
        WHERE t.name IN (${placeholders})
      `
      )
      .all(...tags) as (MemoryRow & { tag_id: string | null; tag_name: string | null })[];

    // Group tags by memory ID and transform memories
    const memoryMap = new Map<string, { row: MemoryRow; tags: Tag[] }>();

    rows.forEach((row) => {
      if (!memoryMap.has(row.id)) {
        memoryMap.set(row.id, { row, tags: [] });
      }
      if (row.tag_id && row.tag_name) {
        memoryMap.get(row.id)?.tags.push({ id: row.tag_id, name: row.tag_name });
      }
    });

    return Array.from(memoryMap.values()).map(({ row, tags }) => transformMemoryRow(row, tags));
  }

  /**
   * Update tags associated with a memory.
   */
  async updateMemoryTags(memoryId: string, newTags: string[]): Promise<boolean> {
    // Ensure memory exists
    const memoryRow = this.db
      .prepare(
        `
      SELECT * 
      FROM memories 
      WHERE id = ?
    `
      )
      .get(memoryId) as MemoryRow | undefined;

    if (!memoryRow) {
      throw new Error(`Memory with ID ${memoryId} not found.`);
    }

    // Fetch existing tags for the memory
    const existingTags = this.db
      .prepare(
        `
      SELECT t.name 
      FROM memory_tags mt
      JOIN tags t ON mt.tag_id = t.id
      WHERE mt.memory_id = ?
    `
      )
      .all(memoryId) as { name: string }[];

    const currentTagNames = existingTags.map((tag) => tag.name);
    const tagsToAdd = newTags.filter((tagName) => !currentTagNames.includes(tagName));
    const tagsToRemove = currentTagNames.filter((tagName) => !newTags.includes(tagName));

    // Add new tags
    for (const tagName of tagsToAdd) {
      // Ensure the tag exists
      let tag = this.db
        .prepare(
          `
        SELECT id 
        FROM tags 
        WHERE name = ?
      `
        )
        .get(tagName) as { id: string } | undefined;

      if (!tag) {
        const newTagId = generateUniqueId();
        this.db
          .prepare(
            `
        INSERT INTO tags (id, name)
        VALUES (?, ?)
      `
          )
          .run(newTagId, tagName);
        tag = { id: newTagId };
      }

      // Associate the tag with the memory
      this.db
        .prepare(
          `
      INSERT OR IGNORE INTO memory_tags (memory_id, tag_id)
      VALUES (?, ?)
    `
        )
        .run(memoryId, tag.id);
    }

    // Remove old tags
    for (const tagName of tagsToRemove) {
      const tag = this.db
        .prepare(
          `
        SELECT id 
        FROM tags 
        WHERE name = ?
      `
        )
        .get(tagName) as { id: string } | undefined;

      if (tag) {
        this.db
          .prepare(
            `
        DELETE FROM memory_tags 
        WHERE memory_id = ? AND tag_id = ?
      `
          )
          .run(memoryId, tag.id);
      }
    }

    return true;
  }
}
