import { Pool } from 'pg';
import { getDb } from '../test-db.helper'; // Assuming this helper is for database setup
import { ChatMessagesService } from '../../../services/sqlite-services/chat-messages.service';
import { insertHelpers } from '../test-db-insert.helper'; // Import insert helpers

let db: Pool;
let chatMessagesService: ChatMessagesService;

beforeAll(async () => {
  await getDb.initialize(); // Initialize the database before tests
  db = getDb.getInstance();
  chatMessagesService = new ChatMessagesService(db);
});

beforeEach(async () => {
  await db.query('BEGIN'); // Start transaction before each test

  // Insert required data (sessions, assistants, chats, memories)
  await insertHelpers.insertAssistant(db, 'assistant123'); // Insert assistant
  await insertHelpers.insertSession(db, 'session123', 'assistant123', 'user123'); // Insert session
  await insertHelpers.insertChat(db, 'chat123', 'session123'); // Insert chat
  await insertHelpers.insertMemory(db, 'memory123', 'Sample memory'); // Insert memory for valid memory_id
  await insertHelpers.insertTagMemory(db, 'memory123', 'tag1'); // Ensure valid tag memory association
});

afterEach(async () => {
  await db.query('DELETE FROM chat_messages'); // Clean up chat_messages table after each test
  await db.query('DELETE FROM chats'); // Clean up chats table
  await db.query('DELETE FROM sessions'); // Clean up sessions table
  await db.query('DELETE FROM assistants'); // Clean up assistants table
  await db.query('DELETE FROM memories'); // Clean up memories table
  await db.query('ROLLBACK'); // Rollback changes after each test to maintain isolation
});

afterAll(async () => {
  await getDb.close(); // Close DB connection after all tests
});

describe('ChatMessagesService Tests', () => {
  test('addMessage - should add a new message to a chat', async () => {
    const chatId = 'chat123'; // Mock chat ID
    const memoryId = 'memory123'; // Mock memory ID
    const type = 'user'; // Example message type (could be 'user' or 'assistant')

    const message = await chatMessagesService.addMessage(chatId, memoryId, type);

    // Check that message was created successfully
    expect(message).toBeDefined();
    expect(message.id).toBeDefined();
    expect(message.chat_id).toBe(chatId);
    expect(message.memory_id).toBe(memoryId);
    expect(message.type).toBe(type);

    // Verify in the database
    const rows = await db.query('SELECT * FROM chat_messages WHERE id = $1', [message.id]);
    expect(rows.rows.length).toBe(1); // Should have 1 row (the created message)
    expect(rows.rows[0].chat_id).toBe(chatId);
    expect(rows.rows[0].memory_id).toBe(memoryId);
    expect(rows.rows[0].type).toBe(type);
  });

  test('getMessagesByChatId - should retrieve all messages for a chat', async () => {
    const chatId = 'chat123';
    const memoryId1 = 'memory123';
    const memoryId2 = 'memory456';
    // const type1 = 'user';
    // const type2 = 'assistant';

    // Add two messages to the database for the same chat
    await insertHelpers.insertChatMessage(db, 'message1', chatId, memoryId1);
    await insertHelpers.insertChatMessage(db, 'message2', chatId, memoryId2);

    // Fetch messages for the chat
    const messages = await chatMessagesService.getMessagesByChatId(chatId);

    // Assertions
    expect(messages).toBeDefined();
    expect(messages).toHaveLength(2); // There should be 2 messages
    expect(messages[0].chat_id).toBe(chatId); // Ensure the chat_id is correct
    expect(messages[1].chat_id).toBe(chatId); // Ensure the chat_id is correct
  });

  test('getMessagesByChatId - should return an empty array if no messages exist for the chat', async () => {
    const chatId = 'chat123'; // Mock chat ID with no messages

    // Fetch messages for the chat
    const messages = await chatMessagesService.getMessagesByChatId(chatId);

    expect(messages).toBeDefined();
    expect(messages).toHaveLength(0); // Should return an empty array since no messages exist
  });
});
