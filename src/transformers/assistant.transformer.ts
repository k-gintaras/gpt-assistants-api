import { Assistant, AssistantRow, AssistantWithDetails, FeedbackStats } from '../models/assistant.model';
import { MemoryFocusRuleRow } from '../models/focused-memory.model';
import { MemoryRow } from '../models/memory.model';
import { Tag, TagRow } from '../models/tag.model';
import { transformMemoryFocusRuleRow } from './memory-focus-rule.transformer';
import { transformMemoryRow } from './memory.transformer';
import { transformTagRow } from './tag.transformer';

export function transformAssistantRow(row: AssistantRow): Assistant {
  const feedback: FeedbackStats = {
    positive: row.feedback_positive,
    negative: row.feedback_negative,
    lastFeedbackDate: row.feedback_lastFeedbackDate ? new Date(row.feedback_lastFeedbackDate) : undefined,
  };

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    instructions: row.instructions || undefined,
    feedback,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export function transformAssistantWithDetails(
  assistantRow: AssistantRow,
  memoryRows: MemoryRow[],
  memoryTags: { [memoryId: string]: Tag[] }, // Mapping memory IDs to tags
  assistantTags: TagRow[], // Rows of tags associated with the assistant
  memoryFocusRuleRow?: MemoryFocusRuleRow
): AssistantWithDetails {
  const assistant = transformAssistantRow(assistantRow);

  const focusedMemories = memoryRows.map((memoryRow) => transformMemoryRow(memoryRow, memoryTags[memoryRow.id] || []));

  const memoryFocusRule = memoryFocusRuleRow ? transformMemoryFocusRuleRow(memoryFocusRuleRow) : undefined;

  const assistantTagsTransformed = assistantTags.map(transformTagRow);

  return {
    ...assistant,
    focusedMemories,
    memoryFocusRule,
    assistantTags: assistantTagsTransformed,
  };
}
