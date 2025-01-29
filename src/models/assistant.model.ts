import { MemoryFocusRule } from './focused-memory.model';
import { MemoryWithTags } from './memory.model';
import { Tag } from './tag.model';

export interface AssistantWithDetails extends Assistant {
  focusedMemories: MemoryWithTags[]; // Relevant memories based on the assistant's focus
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
  type: 'chat' | 'assistant';
  model: string; // Added model field
  createdAt: string; // ISO 8601 formatted date
  updatedAt: string; // ISO 8601 formatted date
}

export interface AssistantRow {
  id: string;
  name: string;
  description: string;
  type: 'chat' | 'assistant';
  model: string; // Added model field
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
