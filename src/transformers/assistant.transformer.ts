import { Assistant, AssistantRow, AssistantWithDetails, FeedbackSummary, FeedbackSummaryRow } from '../models/assistant.model';
import { MemoryFocusRuleRow } from '../models/focused-memory.model';
import { MemoryRow } from '../models/memory.model';
import { Tag, TagRow } from '../models/tag.model';
import { transformMemoryFocusRuleRow } from './memory-focus-rule.transformer';
import { transformMemoryRow } from './memory.transformer';
import { transformTagRow } from './tag.transformer';

export function transformAssistantRow(row: AssistantRow): Assistant {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    model: row.model, // New field
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function transformAssistantWithDetails(
  assistantRow: AssistantRow,
  memoryRows: MemoryRow[],
  memoryTags: { [memoryId: string]: Tag[] }, // Mapping memory IDs to tags
  assistantTags: TagRow[], // Rows of tags associated with the assistant
  memoryFocusRuleRow?: MemoryFocusRuleRow,
  feedbackSummaryRows?: FeedbackSummaryRow
): AssistantWithDetails {
  const assistant = transformAssistantRow(assistantRow);

  const focusedMemories = memoryRows.map((memoryRow) => transformMemoryRow(memoryRow, memoryTags[memoryRow.id] || []));

  const memoryFocusRule = memoryFocusRuleRow ? transformMemoryFocusRuleRow(memoryFocusRuleRow) : undefined;

  const assistantTagsTransformed = assistantTags.map(transformTagRow);

  const feedbackSummary: FeedbackSummary = {
    avgRating: feedbackSummaryRows?.avg_rating || 0,
    totalFeedback: feedbackSummaryRows?.total_feedback || 0,
  };

  return {
    ...assistant,
    focusedMemories,
    memoryFocusRule,
    assistantTags: assistantTagsTransformed,
    feedbackSummary,
  };
}
