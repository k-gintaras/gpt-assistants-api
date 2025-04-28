export interface Session {
  id: string;
  assistant_id: string;
  user_id?: string; // Optional, could be null or undefined if not tied to a user
  name: string;
  started_at: string; // Timestamp when the session started
  ended_at?: string; // Timestamp when the session ended (optional)
  created_at: string; // Timestamp when the session was created
}
