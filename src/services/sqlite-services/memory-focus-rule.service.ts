import { Pool } from 'pg';
import { MemoryFocusRule, MemoryFocusRuleRow } from '../../models/focused-memory.model';
import { transformMemoryFocusRuleRow } from '../../transformers/memory-focus-rule.transformer';
import { generateUniqueId } from './unique-id.service';

export class MemoryFocusRuleService {
  constructor(private pool: Pool) {}

  async createMemoryFocusRule(
    assistantId: string,
    maxResults: number = 5, // Set default value to 5
    relationshipTypes: string[] = [],
    priorityTags: string[] = []
  ): Promise<MemoryFocusRule> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();

    const stmt = `
    INSERT INTO memory_focus_rules (id, assistant_id, max_results, relationship_types, priority_tags, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

    await this.pool.query(stmt, [id, assistantId, maxResults, JSON.stringify(relationshipTypes), JSON.stringify(priorityTags), createdAt, createdAt]);

    return {
      id,
      assistantId,
      maxResults, // Ensure maxResults is returned correctly
      relationshipTypes,
      priorityTags,
      createdAt: new Date(createdAt),
      updatedAt: new Date(createdAt),
    };
  }

  async getMemoryFocusRules(assistantId: string): Promise<MemoryFocusRule | null> {
    const result = await this.pool.query<MemoryFocusRuleRow>('SELECT * FROM memory_focus_rules WHERE assistant_id = $1', [assistantId]);
    return result.rowCount ? transformMemoryFocusRuleRow(result.rows[0]) : null;
  }

  async updateMemoryFocusRule(id: string, updates: Partial<Omit<MemoryFocusRule, 'id' | 'assistantId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const stmt = `
    UPDATE memory_focus_rules
    SET 
      max_results = COALESCE($1, max_results),
      relationship_types = COALESCE($2, relationship_types),
      priority_tags = COALESCE($3, priority_tags),
      updated_at = $4
    WHERE id = $5
    RETURNING *;  -- Add RETURNING to see the updated row
  `;

    const result = await this.pool.query(stmt, [
      updates.maxResults || null,
      updates.relationshipTypes ? JSON.stringify(updates.relationshipTypes) : null,
      updates.priorityTags ? JSON.stringify(updates.priorityTags) : null,
      new Date().toISOString(),
      id,
    ]);

    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Returns true if the rule was updated
  }

  async removeMemoryFocusRule(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM memory_focus_rules WHERE id = $1', [id]);
    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Returns true if the rule was removed
  }
}
