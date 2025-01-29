import { AssistantWithDetails, FeedbackSummary } from '../models/assistant.model';
import { MemoryFocusRule } from '../models/focused-memory.model';
import { Memory, MemoryRow, MemoryWithTags } from '../models/memory.model';
import { Tag } from '../models/tag.model';
import { transformMemoryRow } from './memory.transformer';

export interface FullAssistantRows {
  // Assistant fields
  assistant_id: string;
  assistant_name: string;
  assistant_description: string;
  assistant_type: 'chat' | 'assistant'; // Removed 'completion'
  assistant_model: string; // New field for model
  avg_rating: number;
  total_feedback: number;
  assistant_createdAt: string; // ISO 8601 date
  assistant_updatedAt: string; // ISO 8601 date

  // Assistant tag fields (relational tags)
  assistant_tag_id: string | null;
  assistant_tag_name: string | null;

  // Focus rule fields
  focus_rule_id: string | null;
  focus_rule_maxResults: number | null;
  focus_rule_relationshipTypes: string | null; // Serialized JSON
  focus_rule_priorityTags: string | null; // Serialized JSON
  focus_rule_createdAt: string | null; // ISO 8601 date
  focus_rule_updatedAt: string | null; // ISO 8601 date

  // Memory fields
  memory_id: string | null;
  memory_type: 'instruction' | 'session' | 'prompt' | 'knowledge' | 'meta' | null;
  memory_description: string | null;
  memory_data: string | null; // Serialized JSON
  memory_createdAt: string | null; // ISO 8601 date
  memory_updatedAt: string | null; // ISO 8601 date

  // Memory tag fields (relational tags)
  memory_tag_id: string | null;
  memory_tag_name: string | null;
}

export function transformFullAssistantResult(rows: FullAssistantRows[]): AssistantWithDetails {
  if (rows.length === 0) {
    throw new Error('No rows provided for transformation.');
  }

  const firstRow = rows[0];
  const feedbackSummary: FeedbackSummary = {
    avgRating: firstRow.avg_rating || 0,
    totalFeedback: firstRow.total_feedback || 0,
  };

  const assistant: AssistantWithDetails = {
    id: firstRow.assistant_id,
    name: firstRow.assistant_name,
    description: firstRow.assistant_description,
    type: firstRow.assistant_type,
    model: firstRow.assistant_model,
    assistantTags: [], // Populated below
    createdAt: firstRow.assistant_createdAt,
    updatedAt: firstRow.assistant_updatedAt,
    focusedMemories: transformMemoriesWithTags(rows),
    memoryFocusRule: transformMemoryFocusRule(firstRow),
    feedbackSummary,
  };

  const tags: Tag[] = rows
    .filter((row: FullAssistantRows) => row.assistant_tag_id && row.assistant_tag_name) // Filter out invalid rows
    .map((row: FullAssistantRows) => ({ id: row.assistant_tag_id!, name: row.assistant_tag_name! })); // Map to Tag objects

  // Remove duplicates by using a Map
  assistant.assistantTags = Array.from(new Map(tags.map((tag) => [tag.id, tag])).values());

  return assistant;
}

function transformMemoriesWithTags(rows: FullAssistantRows[]): MemoryWithTags[] {
  const memoriesMap = new Map<string, { memory: MemoryRow; tags: Tag[] }>();

  rows.forEach((row) => {
    if (row.memory_id) {
      const memoryId = row.memory_id;
      if (!memoriesMap.has(memoryId)) {
        memoriesMap.set(memoryId, {
          memory: {
            id: memoryId,
            type: row.memory_type as Memory['type'],
            description: row.memory_description,
            data: row.memory_data,
            createdAt: row.memory_createdAt!,
            updatedAt: row.memory_updatedAt!,
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

// Helper to transform focus rules
function transformMemoryFocusRule(row: FullAssistantRows): MemoryFocusRule | undefined {
  if (!row.focus_rule_id) return undefined;

  return {
    id: row.focus_rule_id,
    assistantId: row.assistant_id,
    maxResults: row.focus_rule_maxResults || 0,
    relationshipTypes: JSON.parse(row.focus_rule_relationshipTypes || '[]'),
    priorityTags: JSON.parse(row.focus_rule_priorityTags || '[]'),
    createdAt: row.focus_rule_createdAt ? new Date(row.focus_rule_createdAt) : new Date(),
    updatedAt: row.focus_rule_updatedAt ? new Date(row.focus_rule_updatedAt) : new Date(),
  };
}
