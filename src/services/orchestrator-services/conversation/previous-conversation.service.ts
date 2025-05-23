import { Pool } from 'pg';

export interface ConversationMessage {
  chatId: string;
  message: string;
  owner: string; // 'assistant' or 'user'
  createdAt: Date;
}

export class PreviousConversationService {
  constructor(private pool: Pool) {}

  async getConversation(chatId: string | null, sessionId: string | null): Promise<ConversationMessage[] | null> {
    if (chatId) return await this.getConversationByChatId(chatId);
    if (sessionId) return await this.getConversationBySessionId(sessionId);
    return null;
  }

  private async getConversationBySessionId(sessionId: string): Promise<ConversationMessage[]> {
    const latestChatRes = await this.pool.query(
      `SELECT id FROM chats
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [sessionId]
    );

    if (latestChatRes.rowCount === 0) return [];

    const chatId = latestChatRes.rows[0].id;

    return await this.getConversationByChatId(chatId);
  }

  private async getConversationByChatId(chatId: string): Promise<ConversationMessage[]> {
    const res = await this.pool.query(
      `SELECT cm.chat_id AS "chatId", cm.type AS "owner", m.description AS "message", cm.created_at AS "createdAt"
       FROM chat_messages cm
       JOIN memories m ON cm.memory_id = m.id
       WHERE cm.chat_id = $1
       ORDER BY cm.created_at ASC`,
      [chatId]
    );
    return res.rows;
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM sessions WHERE id = $1 LIMIT 1', [sessionId]);
    return (result.rowCount ?? 0) > 0;
  }

  async chatExists(chatId: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM chats WHERE id = $1 LIMIT 1', [chatId]);
    return (result.rowCount ?? 0) > 0;
  }

  async chatBelongsToSession(chatId: string, sessionId: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM chats WHERE id = $1 AND session_id = $2 LIMIT 1', [chatId, sessionId]);
    return (result.rowCount ?? 0) > 0;
  }
}
