export interface ChatMessage {
  id: string;
  type: string; // Type of the message, e.g., 'user' or 'assistant'
  memory_id: string; // Links to a memory that this message may be associated with
  created_at: string; // Timestamp when the message was created
  chat_id: string; // Links the message to a chat
}
