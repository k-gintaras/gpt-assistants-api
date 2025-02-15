import { AssistantWithDetails, FeedbackSummary } from '../models/assistant.model';
import { MemoryFocusRule } from '../models/focused-memory.model';
import { Memory, MemoryRow, MemoryWithTags } from '../models/memory.model';
import { Tag } from '../models/tag.model';
import { transformMemoryRow } from './memory.transformer';

export interface FullAssistantRows {
  assistant_id: string;
  gpt_assistant_id: string;
  assistant_name: string;
  assistant_description: string;
  assistant_type: 'chat' | 'assistant';
  assistant_model: string;
  avg_rating: string;
  total_feedback: string;
  assistant_created_at: string;
  assistant_updated_at: string;
  assistant_tag_id: string | null;
  assistant_tag_name: string | null;
  focus_rule_id: string | null;
  focus_rule_max_results: string | null;
  focus_rule_relationship_types: string[] | null;
  focus_rule_priority_tags: string[] | null;
  focus_rule_created_at: string | null;
  focus_rule_updated_at: string | null;
  memory_id: string | null;
  memory_type: 'instruction' | 'session' | 'prompt' | 'knowledge' | 'meta' | null;
  memory_description: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memory_data: any | null; // some kind of json to be returned from database
  memory_created_at: string | null;
  memory_updated_at: string | null;
  memory_tag_id: string | null;
  memory_tag_name: string | null;
}

export function transformFullAssistantResult(rows: FullAssistantRows[]): AssistantWithDetails {
  if (rows.length === 0) {
    throw new Error('No rows provided for transformation.');
  }

  const firstRow = rows[0];

  // Ensure avg_rating and total_feedback are numbers (default to 0 if missing)
  const avgRating = firstRow.avg_rating !== null && firstRow.avg_rating !== undefined ? Number(firstRow.avg_rating) : 0;
  const totalFeedback = firstRow.total_feedback !== null && firstRow.total_feedback !== undefined ? Number(firstRow.total_feedback) : 0;

  const feedbackSummary: FeedbackSummary = {
    avgRating,
    totalFeedback,
  };

  const assistant: AssistantWithDetails = {
    id: firstRow.assistant_id,
    gptAssistantId: firstRow.gpt_assistant_id,
    name: firstRow.assistant_name,
    description: firstRow.assistant_description,
    type: firstRow.assistant_type,
    model: firstRow.assistant_model,
    assistantTags: [], // Will be populated later
    createdAt: firstRow.assistant_created_at,
    updatedAt: firstRow.assistant_updated_at,
    focusedMemories: transformMemoriesWithTags(rows),
    memoryFocusRule: transformMemoryFocusRule(firstRow),
    feedbackSummary,
  };

  // Safely handle assistant tags (filter out null or undefined values)
  const tags: Tag[] = rows
    .flat()
    .filter((row) => row.assistant_tag_id && row.assistant_tag_name) // Ensure both tag_id and tag_name exist
    .map((row) => ({ id: row.assistant_tag_id!, name: row.assistant_tag_name! }));

  assistant.assistantTags = Array.from(new Map(tags.map((tag) => [tag.id, tag])).values());

  return assistant;
}

function transformMemoriesWithTags(rows: FullAssistantRows[]): MemoryWithTags[] {
  const memoriesMap = new Map<string, { memory: MemoryRow; tags: Tag[] }>();

  rows.flat().forEach((row) => {
    if (row.memory_id) {
      const memoryId = row.memory_id;
      if (!memoriesMap.has(memoryId)) {
        memoriesMap.set(memoryId, {
          memory: {
            id: memoryId,
            type: row.memory_type as Memory['type'],
            description: row.memory_description,
            data: row.memory_data,
            created_at: row.memory_created_at!,
            updated_at: row.memory_updated_at!,
          },
          tags: [],
        });
      }

      if (row.memory_tag_id && row.memory_tag_name) {
        memoriesMap.get(memoryId)?.tags.push({
          id: row.memory_tag_id,
          name: row.memory_tag_name,
        });
      }
    }
  });

  return Array.from(memoriesMap.values()).map(({ memory, tags }) => transformMemoryRow(memory, tags));
}

function transformMemoryFocusRule(row: FullAssistantRows): MemoryFocusRule | undefined {
  if (!row.focus_rule_id) return undefined;

  return {
    id: row.focus_rule_id,
    assistantId: row.assistant_id,
    maxResults: Number(row.focus_rule_max_results) || 0,
    relationshipTypes: row.focus_rule_relationship_types || [],
    priorityTags: row.focus_rule_priority_tags || [],
    createdAt: row.focus_rule_created_at ? new Date(row.focus_rule_created_at) : new Date(),
    updatedAt: row.focus_rule_updated_at ? new Date(row.focus_rule_updated_at) : new Date(),
  };
}
