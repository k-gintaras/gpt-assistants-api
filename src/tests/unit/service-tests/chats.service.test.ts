import { Pool } from 'pg';
import { getDb } from '../test-db.helper'; // Assuming this helper is for database setup
import { ChatsService } from '../../../services/sqlite-services/chats.service';
import { insertHelpers } from '../test-db-insert.helper'; // Ensure insertHelpers is imported

let db: Pool;
let chatsService: ChatsService;

beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  chatsService = new ChatsService(db);
});

beforeEach(async () => {
  // Insert a mock session and assistant to satisfy the foreign key constraints
  await insertHelpers.insertAssistant(db, 'assistant123'); // Insert an assistant
  await insertHelpers.insertSession(db, 'session123', 'assistant123', 'user123'); // Insert a session with the assistant and user

  await db.query('BEGIN'); // Start a transaction before each test
});

afterEach(async () => {
  await db.query('DELETE FROM chats'); // Clean up chats table after each test
  await db.query('DELETE FROM sessions'); // Clean up sessions table after each test
  await db.query('DELETE FROM assistants'); // Clean up assistants table after each test
  await db.query('ROLLBACK'); // Rollback changes after each test to maintain isolation
});

afterAll(async () => {
  await getDb.close(); // Close DB connection after all tests
});

describe('ChatsService Tests', () => {
  test('createChat - should create a new chat in a session', async () => {
    const sessionId = 'session123'; // Mock session ID
    const chat = await chatsService.createChat(sessionId);

    // Check that chat was created successfully
    expect(chat).toBeDefined();
    expect(chat.id).toBeDefined();
    expect(chat.session_id).toBe(sessionId);

    // Verify in the database
    const rows = await db.query('SELECT * FROM chats WHERE id = $1', [chat.id]);
    expect(rows.rows.length).toBe(1); // Should have 1 row (the created chat)
    expect(rows.rows[0].session_id).toBe(sessionId);
  });

  test('getChatsBySessionId - should retrieve chats by sessionId', async () => {
    const sessionId = 'session123';

    // Add some chats to the database manually
    await insertHelpers.insertChat(db, 'chat1', sessionId);
    await insertHelpers.insertChat(db, 'chat2', sessionId);

    // Fetch chats for the session
    const chats = await chatsService.getChatsBySessionId(sessionId);

    // Assertions
    expect(chats).toBeDefined();
    expect(chats).toHaveLength(2); // There should be 2 chats
    expect(chats[0].session_id).toBe(sessionId); // Ensure the session_id is correct
  });

  test('getChatsBySessionId - should return an empty array if no chats found for the session', async () => {
    const sessionId = 'session123'; // Mock session ID with no chats

    // Fetch chats for the session
    const chats = await chatsService.getChatsBySessionId(sessionId);

    expect(chats).toBeDefined();
    expect(chats).toHaveLength(0); // Should return an empty array since no chats exist
  });
});
