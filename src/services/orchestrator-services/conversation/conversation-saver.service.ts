import { Pool } from 'pg';
import { generateUniqueId } from '../../sqlite-services/unique-id.service';

export interface Conversation {
  assistantId: string;
  userId: string | null;
  sessionId: string | null;
  chatId: string | null;
  userPrompt: string;
  aiResponse: string;
  taskId: string;
}
export class ConversationSaverService {
  constructor(private pool: Pool) {}

  public async saveConversation(conversation: Conversation): Promise<{ sessionId: string; chatId: string }> {
    const resolvedSessionId = conversation.sessionId || (await this.createSession(conversation.assistantId, conversation.userId));
    const resolvedChatId = conversation.chatId || (await this.createChat(resolvedSessionId));

    const userMemoryId = await this.createMemory('user_message', conversation.userPrompt);
    await this.linkMemoryToChat(resolvedChatId, userMemoryId, 'user');

    const assistantMemoryId = await this.createMemory('ai_response', conversation.aiResponse, { taskId: conversation.taskId });
    await this.linkMemoryToChat(resolvedChatId, assistantMemoryId, 'assistant');

    await this.tagMemory(userMemoryId, ['#chat', `#assistant:${conversation.assistantId}`, '#user']);
    await this.tagMemory(assistantMemoryId, ['#chat', `#assistant:${conversation.assistantId}`, '#assistant']);

    return { sessionId: resolvedSessionId, chatId: resolvedChatId };
  }

  private async createSession(assistantId: string, userId: string | null): Promise<string> {
    const sessionId = generateUniqueId();
    await this.pool.query(`INSERT INTO sessions (id, assistant_id, user_id) VALUES ($1, $2, $3)`, [sessionId, assistantId, userId]);
    return sessionId;
  }

  private async createChat(sessionId: string): Promise<string> {
    const chatId = generateUniqueId();
    await this.pool.query(`INSERT INTO chats (id, session_id) VALUES ($1, $2)`, [chatId, sessionId]);
    return chatId;
  }

  private async createMemory(type: string, description: string, data: Record<string, unknown> = {}): Promise<string> {
    const memoryId = generateUniqueId();
    await this.pool.query(`INSERT INTO memories (id, type, description, data) VALUES ($1, $2, $3, $4)`, [memoryId, type, description, JSON.stringify(data)]);
    return memoryId;
  }

  private async linkMemoryToChat(chatId: string, memoryId: string, owner: 'user' | 'assistant'): Promise<void> {
    const msgId = generateUniqueId();
    await this.pool.query(`INSERT INTO chat_messages (id, chat_id, memory_id, type) VALUES ($1, $2, $3, $4)`, [msgId, chatId, memoryId, owner]);
  }

  private async tagMemory(memoryId: string, tags: string[]): Promise<void> {
    for (const tagName of tags) {
      const tagId = generateUniqueId();
      await this.pool.query(
        `INSERT INTO tags (id, name)
       VALUES ($1, $2)
       ON CONFLICT (name) DO NOTHING`,
        [tagId, tagName]
      );

      // Get the existing tag ID if already created
      const tagRes = await this.pool.query(`SELECT id FROM tags WHERE name = $1`, [tagName]);

      const existingTagId = tagRes.rows[0].id;

      await this.pool.query(
        `INSERT INTO memory_tags (memory_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
        [memoryId, existingTagId]
      );
    }
  }
}
