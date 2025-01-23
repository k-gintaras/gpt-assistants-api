export interface Query {
  id: string; // Unique identifier for the query
  userId: string; // ID of the user making the query
  tags: string[]; // Tags related to the query
  input: string; // User input or question
  context?: string; // Additional context for the query
  results?: string[]; // IDs of relevant assistants, tasks, or memories
  createdAt: Date; // Query timestamp
}
