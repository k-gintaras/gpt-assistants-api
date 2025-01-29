import Database from 'better-sqlite3';
import { MemoryFocusRule, MemoryFocusRuleRow } from '../../models/focused-memory.model';
import { transformMemoryFocusRuleRow } from '../../transformers/memory-focus-rule.transformer';
import { generateUniqueId } from './unique-id.service';

export class MemoryFocusRuleService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  async createMemoryFocusRule(assistantId: string, maxResults: number, relationshipTypes: string[] = [], priorityTags: string[] = []): Promise<MemoryFocusRule> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO memory_focus_rules (id, assistant_id, maxResults, relationshipTypes, priorityTags, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, assistantId, maxResults, JSON.stringify(relationshipTypes), JSON.stringify(priorityTags), createdAt, createdAt);

    // Return the created rule as an object
    return {
      id,
      assistantId,
      maxResults,
      relationshipTypes,
      priorityTags,
      createdAt: new Date(createdAt),
      updatedAt: new Date(createdAt),
    };
  }

  async getMemoryFocusRules(assistantId: string): Promise<MemoryFocusRule | null> {
    const row = this.db
      .prepare(
        `
      SELECT * 
      FROM memory_focus_rules 
      WHERE assistant_id = ?
    `
      )
      .get(assistantId) as MemoryFocusRuleRow | undefined;

    return row ? transformMemoryFocusRuleRow(row) : null;
  }
  async updateMemoryFocusRule(id: string, updates: Partial<Omit<MemoryFocusRule, 'id' | 'assistantId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE memory_focus_rules
      SET 
        maxResults = COALESCE(?, maxResults),
        relationshipTypes = COALESCE(?, relationshipTypes),
        priorityTags = COALESCE(?, priorityTags),
        updatedAt = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      updates.maxResults || null,
      updates.relationshipTypes ? JSON.stringify(updates.relationshipTypes) : null,
      updates.priorityTags ? JSON.stringify(updates.priorityTags) : null,
      new Date().toISOString(),
      id
    );

    return result.changes > 0; // Returns true if the rule was updated
  }
  async removeMemoryFocusRule(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM memory_focus_rules
      WHERE id = ?
    `);

    const result = stmt.run(id);

    return result.changes > 0; // Returns true if the rule was removed
  }
}
