export interface Feedback {
  id: string; // Unique identifier for the feedback
  targetId: string; // ID of the target (assistant, memory, or task)
  type: 'assistant' | 'memory' | 'task'; // Target type
  rating: number; // Rating (e.g., 1-5 stars)
  comments?: string; // Additional comments
  createdAt: Date; // Feedback timestamp
}
