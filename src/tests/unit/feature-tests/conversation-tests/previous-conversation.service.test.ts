import { Pool } from 'pg';
import { getDb } from '../../test-db.helper';
import { PreviousConversationService } from '../../../../services/orchestrator-services/conversation/previous-conversation.service';

describe('PreviousConversationService', () => {
  let db: Pool;
  let service: PreviousConversationService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
  });

  beforeEach(async () => {
    await db.query('BEGIN');

    await db.query(`
      INSERT INTO assistants (id, name, description, type, model)
      VALUES ('a', 'Test Assistant', 'Description', 'chat', 'gpt-3.5-turbo')
    `);

    service = new PreviousConversationService(db);
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  afterAll(async () => {
    await getDb.close();
  });

  test('getConversation returns messages by chatId', async () => {
    const sessionId = 'sess-1';
    const chatId = 'chat-1';
    const memoryId = 'mem-1';

    await db.query(`INSERT INTO sessions (id, assistant_id) VALUES ($1, 'a')`, [sessionId]);
    await db.query(`INSERT INTO chats (id, session_id) VALUES ($1, $2)`, [chatId, sessionId]);
    await db.query(`INSERT INTO memories (id, type, description) VALUES ($1, 'user_message', 'Hi')`, [memoryId]);
    await db.query(
      `INSERT INTO chat_messages (id, chat_id, memory_id, type, created_at)
                    VALUES ('msg-1', $1, $2, 'user', NOW())`,
      [chatId, memoryId]
    );

    const messages = await service.getConversation(chatId, null);
    expect(messages).toHaveLength(1);
    expect(messages?.[0].chatId).toBe(chatId);
    expect(messages?.[0].message).toBe('Hi');
  });

  test('getConversation returns latest chat in session', async () => {
    const sessionId = 'sess-2';
    const chatOld = 'chat-old';
    const chatNew = 'chat-new';
    const memoryId = 'mem-2';

    await db.query(`INSERT INTO sessions (id, assistant_id) VALUES ($1, 'a')`, [sessionId]);
    await db.query(`INSERT INTO chats (id, session_id, created_at) VALUES ($1, $2, NOW() - INTERVAL '1 day')`, [chatOld, sessionId]);
    await db.query(`INSERT INTO chats (id, session_id, created_at) VALUES ($1, $2, NOW())`, [chatNew, sessionId]);
    await db.query(`INSERT INTO memories (id, type, description) VALUES ($1, 'ai_response', 'Hello')`, [memoryId]);
    await db.query(
      `INSERT INTO chat_messages (id, chat_id, memory_id, type, created_at)
                    VALUES ('msg-2', $1, $2, 'assistant', NOW())`,
      [chatNew, memoryId]
    );

    const messages = await service.getConversation(null, sessionId);
    expect(messages).toHaveLength(1);
    expect(messages?.[0].chatId).toBe(chatNew);
    expect(messages?.[0].message).toBe('Hello');
  });

  test('sessionExists returns true/false accurately', async () => {
    await db.query(`INSERT INTO sessions (id, assistant_id) VALUES ('sess-exists', 'a')`);

    expect(await service.sessionExists('sess-exists')).toBe(true);
    expect(await service.sessionExists('missing-sess')).toBe(false);
  });

  test('chatExists returns true/false accurately', async () => {
    await db.query(`INSERT INTO sessions (id, assistant_id) VALUES ('sess-chat', 'a')`);
    await db.query(`INSERT INTO chats (id, session_id) VALUES ('chat-exists', 'sess-chat')`);

    expect(await service.chatExists('chat-exists')).toBe(true);
    expect(await service.chatExists('chat-missing')).toBe(false);
  });

  test('chatBelongsToSession verifies relationship', async () => {
    await db.query(`INSERT INTO sessions (id, assistant_id) VALUES ('sess-check', 'a')`);
    await db.query(`INSERT INTO chats (id, session_id) VALUES ('chat-check', 'sess-check')`);

    expect(await service.chatBelongsToSession('chat-check', 'sess-check')).toBe(true);
    expect(await service.chatBelongsToSession('chat-check', 'wrong-sess')).toBe(false);
  });

  test('getConversationBySessionId returns empty if session has no chats', async () => {
    await db.query(`INSERT INTO sessions (id, assistant_id) VALUES ('empty-session', 'a')`);

    const result = await service.getConversation(null, 'empty-session');
    expect(result).toEqual([]);
  });
});
