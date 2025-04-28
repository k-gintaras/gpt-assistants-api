import { Pool } from 'pg';
import { generateUniqueId } from './unique-id.service';
import { ChatMessage } from '../../models/chat-message.model'; // Import the interface

export class ChatMessagesService {
  constructor(private pool: Pool) {}

  // Add a message to a chat
  async addMessage(chatId: string, memoryId: string, type: string): Promise<ChatMessage> {
    const messageId = generateUniqueId();
    const createdAt = new Date().toISOString();

    const stmt = `
      INSERT INTO chat_messages (id, type, memory_id, created_at, chat_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await this.pool.query(stmt, [messageId, type, memoryId, createdAt, chatId]);

    return result.rows[0]; // Returning the created ChatMessage object
  }

  // Get all messages for a chat
  async getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
    const result = await this.pool.query('SELECT * FROM chat_messages WHERE chat_id = $1', [chatId]);
    return result.rows; // Returning array of ChatMessage objects
  }
}
