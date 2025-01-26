import { MemoryFocusRule } from './focused-memory.model';
import { Memory } from './memory.model';
import { Tag } from './tag.model';

export interface AssistantWithDetails extends Assistant {
  focusedMemories: Memory[]; // Relevant memories based on the assistant's focus
  memoryFocusRule?: MemoryFocusRule; // Rules guiding memory selection
  assistantTags?: Tag[]; // Tags associated with the assistant
  feedbackSummary: FeedbackSummary; // Aggregate feedback calculated from tasks
}

export interface FeedbackSummary {
  avgRating: number; // Average feedback rating (1-5)
  totalFeedback: number; // Total number of feedback entries
}
export interface FeedbackSummaryRow {
  avg_rating: number; // Average feedback rating (1-5)
  total_feedback: number; // Total number of feedback entries
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  type: 'completion' | 'chat' | 'assistant';
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantRow {
  id: string;
  name: string;
  description: string;
  type: 'completion' | 'chat' | 'assistant';
  instructions: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
