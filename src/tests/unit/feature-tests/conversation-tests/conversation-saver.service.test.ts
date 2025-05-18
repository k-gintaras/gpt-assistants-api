import { Pool } from 'pg';
import { getDb } from '../../test-db.helper';
import { ConversationSaverService, Conversation } from '../../../../services/orchestrator-services/conversation/conversation-saver.service';

describe('ConversationSaverService', () => {
  let db: Pool;
  let saver: ConversationSaverService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
  });

  beforeEach(async () => {
    saver = new ConversationSaverService(db);
    await db.query('BEGIN');

    // Insert the test assistant
    await db.query(`
    INSERT INTO assistants (id, name, description, type, model)
    VALUES ('test-assistant-id', 'Test Assistant', 'Description', 'chat', 'gpt-3.5-turbo')
    ON CONFLICT (id) DO NOTHING
  `);
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  afterAll(async () => {
    await getDb.close();
  });

  const testConversation: Conversation = {
    assistantId: 'test-assistant-id',
    userId: 'user-123',
    sessionId: null,
    chatId: null,
    userPrompt: 'What is the meaning of life?',
    aiResponse: '42',
    taskId: 'task-abc',
  };

  test('creates session, chat, memories and tags if none exist', async () => {
    const { sessionId, chatId } = await saver.saveConversation(testConversation);

    // Verify session
    const session = await db.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    expect(session.rowCount).toBe(1);
    expect(session.rows[0].assistant_id).toBe(testConversation.assistantId);

    // Verify chat
    const chat = await db.query('SELECT * FROM chats WHERE id = $1', [chatId]);
    expect(chat.rowCount).toBe(1);
    expect(chat.rows[0].session_id).toBe(sessionId);

    // Verify memories
    const memories = await db.query(
      `
      SELECT * FROM memories WHERE description IN ($1, $2)
    `,
      [testConversation.userPrompt, testConversation.aiResponse]
    );
    expect(memories.rowCount).toBe(2);

    // Verify chat messages
    const messages = await db.query('SELECT * FROM chat_messages WHERE chat_id = $1', [chatId]);
    expect(messages.rowCount).toBe(2); // user + assistant messages

    // Verify tags
    const tagCount = await db.query(`
      SELECT * FROM memory_tags mt
      JOIN tags t ON t.id = mt.tag_id
      WHERE mt.memory_id IN (${memories.rows.map((m) => `'${m.id}'`).join(',')})
    `);
    expect(tagCount.rowCount).toBeGreaterThanOrEqual(6); // 3 per memory
  });

  // Add more tests if needed (e.g., chat already exists, reuses session ID, etc.)
});
