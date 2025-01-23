import { MemoryFocusRule, MemoryFocusRuleRow } from '../models/focused-memory.model';

export function transformMemoryFocusRuleRow(row: MemoryFocusRuleRow): MemoryFocusRule {
  return {
    id: row.id,
    assistantId: row.assistant_id,
    maxResults: row.maxResults,
    relationshipTypes: row.relationshipTypes ? JSON.parse(row.relationshipTypes) : [], // Default to an empty array
    priorityTags: row.priorityTags ? JSON.parse(row.priorityTags) : [], // Default to an empty array
    createdAt: new Date(row.createdAt), // Ensure a valid Date is created
    updatedAt: new Date(row.updatedAt), // Ensure a valid Date is created
  };
}
