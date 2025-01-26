export interface Feedback {
  id: string; // Unique identifier for the feedback
  targetId: string; // ID of the target entity (assistant, memory, or task)
  targetType: 'assistant' | 'memory' | 'task'; // Type of entity receiving feedback
  userId?: string; // ID of the user providing feedback (optional)
  rating: number; // Feedback rating (e.g., 1-5 stars)
  comments?: string; // Additional feedback comments (optional)
  createdAt: Date; // Timestamp of feedback creation
  updatedAt: Date; // Timestamp of feedback update
}
export interface FeedbackRow {
  id: string; // Unique identifier for the feedback
  target_id: string; // ID of the target entity (assistant, memory, or task)
  target_type: 'assistant' | 'memory' | 'task'; // Type of entity receiving feedback
  user_id?: string; // ID of the user providing feedback (optional)
  rating: number; // Feedback rating (e.g., 1-5 stars)
  comments?: string; // Additional feedback comments (optional)
  createdAt: Date; // Timestamp of feedback creation
  updatedAt: Date; // Timestamp of feedback update
}
