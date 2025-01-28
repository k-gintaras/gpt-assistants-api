import { AssistantWithDetails, FeedbackSummary } from '../models/assistant.model';
import { Memory } from '../models/memory.model';
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

  // Extract assistant details from the first row
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
    model: firstRow.assistant_model, // Added model field
    assistantTags: [], // Populated below
    createdAt: firstRow.assistant_createdAt,
    updatedAt: firstRow.assistant_updatedAt,
    focusedMemories: [],
    memoryFocusRule: undefined,
    feedbackSummary,
  };

  // Group assistant tags
  const assistantTagsMap = new Map<string, Tag>();
  rows.forEach((row) => {
    if (row.assistant_tag_id && row.assistant_tag_name) {
      if (!assistantTagsMap.has(row.assistant_tag_id)) {
        assistantTagsMap.set(row.assistant_tag_id, {
          id: row.assistant_tag_id,
          name: row.assistant_tag_name,
        });
      }
    }
  });
  assistant.assistantTags = Array.from(assistantTagsMap.values());

  // Group and transform focused memories
  const focusedMemoriesMap = new Map<string, { row: FullAssistantRows; tags: Tag[] }>();
  rows.forEach((row) => {
    if (row.memory_id) {
      if (!focusedMemoriesMap.has(row.memory_id)) {
        focusedMemoriesMap.set(row.memory_id, { row, tags: [] });
      }
      if (row.memory_tag_id && row.memory_tag_name) {
        focusedMemoriesMap.get(row.memory_id)?.tags.push({
          id: row.memory_tag_id,
          name: row.memory_tag_name,
        });
      }
    }
  });

  assistant.focusedMemories = Array.from(focusedMemoriesMap.values())
    .map(({ row, tags }) => {
      if (!row.memory_id || !row.memory_type) {
        console.warn(`Skipping row with incomplete memory details: ${JSON.stringify(row)}`);
        return null;
      }

      return transformMemoryRow(
        {
          id: row.memory_id,
          type: row.memory_type as Memory['type'], // Cast safely after null-check
          description: row.memory_description || null,
          data: row.memory_data,
          createdAt: row.memory_createdAt!,
          updatedAt: row.memory_updatedAt!,
        },
        tags
      );
    })
    .filter((memory): memory is Memory => memory !== null); // Filter out nulls

  // Transform memory focus rule (if exists)
  if (firstRow.focus_rule_id) {
    assistant.memoryFocusRule = {
      id: firstRow.focus_rule_id,
      assistantId: firstRow.assistant_id,
      maxResults: firstRow.focus_rule_maxResults || 0,
      relationshipTypes: JSON.parse(firstRow.focus_rule_relationshipTypes || '[]'),
      priorityTags: JSON.parse(firstRow.focus_rule_priorityTags || '[]'),
      createdAt: firstRow.focus_rule_createdAt ? new Date(firstRow.focus_rule_createdAt) : new Date(),
      updatedAt: firstRow.focus_rule_updatedAt ? new Date(firstRow.focus_rule_updatedAt) : new Date(),
    };
  }

  return assistant;
}
