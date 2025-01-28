import Database from 'better-sqlite3';
import { MemoryFocusRule, MemoryFocusRuleRow } from '../../models/focused-memory.model';
import { transformMemoryFocusRuleRow } from '../../transformers/memory-focus-rule.transformer';

export class MemoryFocusRuleService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
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
