import { Pool } from 'pg';
import { generateUniqueId } from './unique-id.service';
import { Chat } from '../../models/chat.model'; // Import the interface

export class ChatsService {
  constructor(private pool: Pool) {}

  // Create a new chat in a session
  async createChat(sessionId: string): Promise<Chat> {
    const chatId = generateUniqueId();
    const createdAt = new Date().toISOString();

    const stmt = `
      INSERT INTO chats (id, session_id, created_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const result = await this.pool.query(stmt, [chatId, sessionId, createdAt]);

    return result.rows[0]; // Returning the created Chat object
  }

  // Get all chats for a session
  async getChatsBySessionId(sessionId: string): Promise<Chat[]> {
    const result = await this.pool.query('SELECT * FROM chats WHERE session_id = $1', [sessionId]);
    return result.rows; // Returning array of Chat objects
  }
}
