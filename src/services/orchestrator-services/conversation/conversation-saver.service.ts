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
    // Step 1: Resolve the session ID
    let resolvedSessionId = conversation.sessionId;

    // If we have a chat ID but no session ID, try to find the associated session
    if (conversation.chatId && !resolvedSessionId) {
      resolvedSessionId = await this.getSessionIdForChat(conversation.chatId);
    }

    // If we still don't have a session ID, create a new one
    if (!resolvedSessionId) {
      resolvedSessionId = await this.createSession(conversation.assistantId, conversation.userId);
    }

    // Step 2: Resolve the chat ID
    let resolvedChatId = conversation.chatId;

    // Check if the chat ID exists in our database
    if (resolvedChatId) {
      const chatExists = await this.chatExists(resolvedChatId);
      if (!chatExists) {
        // If the chat ID from AI API doesn't exist, create it in our database
        await this.createChat(resolvedSessionId, resolvedChatId);
      }
    } else {
      // If no chat ID was provided, create a new one
      resolvedChatId = await this.createChat(resolvedSessionId);
    }

    // Step 3: Create and link memories
    // Create a memory for the user's message
    const userMemoryId = await this.createMemory('user_message', conversation.userPrompt);
    await this.linkMemoryToChat(resolvedChatId, userMemoryId, 'user');

    // Create a memory for the AI's response
    const assistantMemoryId = await this.createMemory('ai_response', conversation.aiResponse, { taskId: conversation.taskId });
    await this.linkMemoryToChat(resolvedChatId, assistantMemoryId, 'assistant');

    // Step 4: Add tags to the memories
    await this.tagMemory(userMemoryId, ['#chat', `#assistant:${conversation.assistantId}`, '#user']);
    await this.tagMemory(assistantMemoryId, ['#chat', `#assistant:${conversation.assistantId}`, '#assistant']);

    return { sessionId: resolvedSessionId, chatId: resolvedChatId };
  }

  private async createSession(assistantId: string, userId: string | null): Promise<string> {
    const sessionId = generateUniqueId();
    await this.pool.query(
      `INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sessionId, assistantId, userId, `Session ${new Date().toISOString()}`, new Date().toISOString(), new Date().toISOString()]
    );
    return sessionId;
  }

  private async createChat(sessionId: string, chatId?: string): Promise<string> {
    const id = chatId || generateUniqueId();
    await this.pool.query(
      `INSERT INTO chats (id, session_id, created_at)
       VALUES ($1, $2, $3)`,
      [id, sessionId, new Date().toISOString()]
    );
    return id;
  }

  private async createMemory(type: string, description: string, data: Record<string, unknown> = {}): Promise<string> {
    const memoryId = generateUniqueId();
    await this.pool.query(
      `INSERT INTO memories (id, type, description, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [memoryId, type, description, JSON.stringify(data), new Date().toISOString(), new Date().toISOString()]
    );
    return memoryId;
  }

  private async linkMemoryToChat(chatId: string, memoryId: string, owner: 'user' | 'assistant'): Promise<void> {
    const msgId = generateUniqueId();
    await this.pool.query(
      `INSERT INTO chat_messages (id, chat_id, memory_id, type)
       VALUES ($1, $2, $3, $4)`,
      [msgId, chatId, memoryId, owner]
    );
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

  private async getSessionIdForChat(chatId: string): Promise<string | null> {
    const result = await this.pool.query(`SELECT session_id FROM chats WHERE id = $1 LIMIT 1`, [chatId]);

    return result.rows.length > 0 ? result.rows[0].session_id : null;
  }

  private async chatExists(chatId: string): Promise<boolean> {
    const result = await this.pool.query(`SELECT id FROM chats WHERE id = $1 LIMIT 1`, [chatId]);

    return result.rows.length > 0;
  }
}
