import { MemoryFocusRuleRow, MemoryFocusRule } from '../models/focused-memory.model';

export function transformMemoryFocusRuleRow(row: MemoryFocusRuleRow): MemoryFocusRule {
  const defaultReturn: string[] = [];
  return {
    id: row.id,
    assistantId: row.assistant_id,
    maxResults: row.max_results ? Number(row.max_results) : row.max_results,
    relationshipTypes: row.relationship_types || defaultReturn,
    priorityTags: row.priority_tags || defaultReturn,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
