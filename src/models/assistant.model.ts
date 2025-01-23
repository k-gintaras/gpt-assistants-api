import { MemoryFocusRule } from './focused-memory.model';
import { Memory } from './memory.model';
import { Tag } from './tag.model';

export interface AssistantWithDetails extends Assistant {
  focusedMemories: Memory[]; // The subset of memories relevant to the assistant's current focus
  memoryFocusRule?: MemoryFocusRule; // Rules guiding the selection of focused memories
  assistantTags?: Tag[]; // Tags associated with the assistant
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  type: 'completion' | 'chat' | 'assistant';
  instructions?: string;
  feedback: FeedbackStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackStats {
  positive: number; // Count of positive feedback
  negative: number; // Count of negative feedback
  lastFeedbackDate?: Date; // Timestamp of the most recent feedback
}

export interface AssistantRow {
  id: string;
  name: string;
  description: string;
  type: 'completion' | 'chat' | 'assistant';
  instructions: string | null;
  feedback_positive: number;
  feedback_negative: number;
  feedback_lastFeedbackDate: string | null; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
