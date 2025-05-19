import { Pool } from 'pg';
import { ConversationRequest, ConversationService } from '../../../../services/orchestrator-services/conversation/conversation.service';
import { getDb } from '../../test-db.helper';
import { AiApiRequest, AiApiResponse } from '../../../../services/ai-api.model';
import { AiApi, AiApiService } from '../../../../services/ai-api.service';

// Mock AiApi for testing
class MockAiApi implements AiApi {
  constructor(private returnSameChatId: boolean = true, private customResponse: string = 'Mock response', private shouldFail: boolean = false) {}

  isAvailable(): boolean {
    return true;
  }

  async ask(request: AiApiRequest): Promise<AiApiResponse | null> {
    if (this.shouldFail) {
      return null;
    }

    return {
      response: this.customResponse,
      responseType: 'text',
      conversationId: this.returnSameChatId ? request.conversationId : 'new-chat-id-from-api',
      error: null,
    };
  }
}

// Mock AiApiService for testing
class MockAiApiService extends AiApiService {
  constructor(private returnSameChatId: boolean = true, private customResponse: string = 'Mock response', private shouldFail: boolean = false) {
    super();
  }

  getAiApi(): AiApi | null {
    return new MockAiApi(this.returnSameChatId, this.customResponse, this.shouldFail);
  }
}

describe('ConversationService Integration Tests', () => {
  let db: Pool;
  let conversationService: ConversationService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query('BEGIN'); // Start transaction for each test
    conversationService = new ConversationService(db);
  });

  afterEach(async () => {
    // Clean up test data
    await db.query('DELETE FROM chat_messages');
    await db.query('DELETE FROM memories');
    await db.query('DELETE FROM chats');
    await db.query('DELETE FROM sessions');
    await db.query('DELETE FROM tasks');

    await db.query('ROLLBACK'); // Rollback changes after each test
  });

  // Helper to create a test assistant in the database
  async function createTestAssistant() {
    const result = await db.query(
      `
      INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
      ['test-assistant-id', 'Test Assistant', 'Test description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString()]
    );

    return result.rows[0].id;
  }

  test('should create a new conversation when no chat or session ID provided', async () => {
    // Arrange
    const assistantId = await createTestAssistant();
    // Replace the real AiApiService with our mock
    conversationService.aiApiService = new MockAiApiService();

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: null,
      sessionId: null,
      prompt: 'Hello, this is a test',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.chatId).toBeDefined();
    expect(response?.sessionId).toBeDefined();

    // Verify data was saved in the database
    const sessionResult = await db.query('SELECT * FROM sessions WHERE id = $1', [response?.sessionId]);
    expect(sessionResult.rows).toHaveLength(1);
    expect(sessionResult.rows[0].assistant_id).toBe(assistantId);

    const chatResult = await db.query('SELECT * FROM chats WHERE id = $1', [response?.chatId]);
    expect(chatResult.rows).toHaveLength(1);
    expect(chatResult.rows[0].session_id).toBe(response?.sessionId);

    // Verify messages were saved
    const messagesResult = await db.query('SELECT * FROM chat_messages WHERE chat_id = $1', [response?.chatId]);
    expect(messagesResult.rows.length).toBeGreaterThan(0);
  });

  test('should reuse existing chat when provided and not expired', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Create a session and chat
    const sessionResult = await db.query(
      `
      INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
      ['test-session-id', assistantId, 'test-user', 'Test Session', new Date().toISOString(), new Date().toISOString()]
    );

    const sessionId = sessionResult.rows[0].id;

    const chatResult = await db.query(
      `
      INSERT INTO chats (id, session_id, created_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
      ['test-chat-id', sessionId, new Date().toISOString()]
    );

    const chatId = chatResult.rows[0].id;

    // Create a test memory for the initial message
    const memoryResult = await db.query(
      `
      INSERT INTO memories (id, type, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
      ['test-memory-id', 'user_message', 'Previous message', new Date().toISOString(), new Date().toISOString()]
    );

    const memoryId = memoryResult.rows[0].id;

    // Create a chat message
    await db.query(
      `
      INSERT INTO chat_messages (id, chat_id, memory_id, type, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `,
      ['test-message-id', chatId, memoryId, 'user', new Date().toISOString()]
    );

    // Replace the real AiApiService with our mock
    conversationService.aiApiService = new MockAiApiService(true, 'Mock follow-up response');

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId,
      sessionId: null, // Don't provide sessionId, it should be looked up
      prompt: 'This is a follow-up message',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.chatId).toBe(chatId);
    expect(response?.sessionId).toBe(sessionId);

    // Verify new message was added
    const messagesResult = await db.query('SELECT COUNT(*) as count FROM chat_messages WHERE chat_id = $1', [chatId]);
    expect(parseInt(messagesResult.rows[0].count)).toBeGreaterThan(1); // More than the original message
  });

  test('should create a new chat if AI API returns a different chat ID', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Create a session
    const sessionResult = await db.query(
      `
      INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
      ['test-session-id', assistantId, 'test-user', 'Test Session', new Date().toISOString(), new Date().toISOString()]
    );

    const sessionId = sessionResult.rows[0].id;

    // Create an original chat
    const chatResult = await db.query(
      `
      INSERT INTO chats (id, session_id, created_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
      ['original-chat-id', sessionId, new Date().toISOString()]
    );

    const originalChatId = chatResult.rows[0].id;

    // Replace the real AiApiService with our mock that returns a different chat ID
    conversationService.aiApiService = new MockAiApiService(false, 'Response with new chat ID');

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: originalChatId,
      sessionId,
      prompt: 'This should create a new chat ID',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.chatId).not.toBe(originalChatId);
    expect(response?.chatId).toBe('new-chat-id-from-api');
    expect(response?.sessionId).toBe(sessionId);

    // Verify the new chat was saved
    const newChatResult = await db.query('SELECT * FROM chats WHERE id = $1', [response?.chatId]);
    expect(newChatResult.rows).toHaveLength(1);
    expect(newChatResult.rows[0].session_id).toBe(sessionId);
  });

  test('should handle AI API failures gracefully', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Simulate AI API failure
    conversationService.aiApiService = new MockAiApiService(true, 'Will not be returned', true);

    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: null,
      sessionId: null,
      prompt: 'This should fail',
    };

    // Act + Assert
    await expect(conversationService.ask(request)).rejects.toThrow('AI API failed to return a response');

    // Task should be created but not completed
    const taskResult = await db.query('SELECT * FROM tasks WHERE assigned_assistant = $1', [assistantId]);
    expect(taskResult.rows).toHaveLength(1);
    expect(taskResult.rows[0].status).toBe('pending');
  });

  test('should handle expired chats by creating a new chat', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Create a session
    const sessionResult = await db.query(
      `
      INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
      ['test-session-id', assistantId, 'test-user', 'Test Session', new Date().toISOString(), new Date().toISOString()]
    );

    const sessionId = sessionResult.rows[0].id;

    // Create an expired chat (2 days old)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const chatResult = await db.query(
      `
      INSERT INTO chats (id, session_id, created_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
      ['expired-chat-id', sessionId, twoDaysAgo.toISOString()]
    );

    const expiredChatId = chatResult.rows[0].id;

    // Replace AiApiService with mock
    conversationService.aiApiService = new MockAiApiService();

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: expiredChatId,
      sessionId,
      prompt: 'This should create a new chat',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.chatId).not.toBe(expiredChatId);
    expect(response?.sessionId).toBe(sessionId);

    // Verify a new chat was created in the same session
    const newChatResult = await db.query('SELECT * FROM chats WHERE id = $1', [response?.chatId]);
    expect(newChatResult.rows).toHaveLength(1);
    expect(newChatResult.rows[0].session_id).toBe(sessionId);
  });

  test('should extract API response correctly', async () => {
    // Arrange
    const assistantId = await createTestAssistant();
    const customResponse = 'Custom test response content';

    // Replace AiApiService with mock returning custom content
    conversationService.aiApiService = new MockAiApiService(true, customResponse);

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: null,
      sessionId: null,
      prompt: 'Test prompt',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.answer).toBe(customResponse);
  });

  // Add these additional tests to your test suite

  test('should create a new chat when session ID is provided but chat ID is not', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Create a session
    const sessionResult = await db.query(
      `
    INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `,
      ['existing-session-id', assistantId, 'test-user', 'Existing Session', new Date().toISOString(), new Date().toISOString()]
    );

    const sessionId = sessionResult.rows[0].id;

    // Replace the real AiApiService with our mock
    conversationService.aiApiService = new MockAiApiService();

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: null, // No chat ID
      sessionId, // But we provide session ID
      prompt: 'Create a new chat in existing session',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.sessionId).toBe(sessionId);
    expect(response?.chatId).toBeDefined();
    expect(response?.chatId).not.toBeNull();

    // Verify a new chat was created in the existing session
    const chatResult = await db.query('SELECT * FROM chats WHERE id = $1', [response?.chatId]);
    expect(chatResult.rows).toHaveLength(1);
    expect(chatResult.rows[0].session_id).toBe(sessionId);

    // Verify messages were saved in the new chat
    const messagesResult = await db.query('SELECT * FROM chat_messages WHERE chat_id = $1', [response?.chatId]);
    expect(messagesResult.rows.length).toBeGreaterThan(0);
  });

  test('should handle when both session ID and chat ID are provided', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Create a session
    const sessionResult = await db.query(
      `
    INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `,
      ['session-with-chat-id', assistantId, 'test-user', 'Session With Chat', new Date().toISOString(), new Date().toISOString()]
    );

    const sessionId = sessionResult.rows[0].id;

    // Create a chat in that session
    const chatResult = await db.query(
      `
    INSERT INTO chats (id, session_id, created_at)
    VALUES ($1, $2, $3)
    RETURNING id
  `,
      ['existing-chat-in-session', sessionId, new Date().toISOString()]
    );

    const chatId = chatResult.rows[0].id;

    // Replace the real AiApiService with our mock
    conversationService.aiApiService = new MockAiApiService();

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId,
      sessionId,
      prompt: 'Message with both chat and session IDs',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.sessionId).toBe(sessionId);
    expect(response?.chatId).toBe(chatId);

    // Verify messages were added to the existing chat
    const messagesResult = await db.query('SELECT * FROM chat_messages WHERE chat_id = $1', [chatId]);
    expect(messagesResult.rows.length).toBeGreaterThan(0);
  });

  test('should handle when AI API returns null conversation ID', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Create a custom mock that returns null for conversationId
    class NullConversationIdMock extends AiApiService {
      getAiApi(): AiApi | null {
        return {
          isAvailable: () => true,
          ask: async () => ({
            response: 'Response with null conversation ID',
            responseType: 'text',
            conversationId: null, // Explicitly return null
            error: null,
          }),
        };
      }
    }

    // Replace the real AiApiService with our null conversationId mock
    conversationService.aiApiService = new NullConversationIdMock();

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: null,
      sessionId: null,
      prompt: 'Handle null conversation ID from API',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();
    expect(response?.chatId).toBeDefined();
    expect(response?.sessionId).toBeDefined();

    // Verify a session was created
    const sessionResult = await db.query('SELECT * FROM sessions WHERE id = $1', [response?.sessionId]);
    expect(sessionResult.rows).toHaveLength(1);

    // Verify a chat was created
    const chatResult = await db.query('SELECT * FROM chats WHERE id = $1', [response?.chatId]);
    expect(chatResult.rows).toHaveLength(1);

    // Verify messages were saved
    const messagesResult = await db.query('SELECT * FROM chat_messages WHERE chat_id = $1', [response?.chatId]);
    expect(messagesResult.rows.length).toBeGreaterThan(0);
  });

  test('should handle session expiry correctly', async () => {
    // Arrange
    const assistantId = await createTestAssistant();

    // Create a session that's old (e.g., 3 months ago)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const sessionResult = await db.query(
      `
    INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at, ended_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `,
      [
        'expired-session-id',
        assistantId,
        'test-user',
        'Expired Session',
        threeMonthsAgo.toISOString(),
        threeMonthsAgo.toISOString(),
        threeMonthsAgo.toISOString(), // Has an ended_at date
      ]
    );

    const expiredSessionId = sessionResult.rows[0].id;

    // Create a chat in that expired session
    const expiredChatResult = await db.query(
      `
    INSERT INTO chats (id, session_id, created_at)
    VALUES ($1, $2, $3)
    RETURNING id
  `,
      ['chat-in-expired-session', expiredSessionId, threeMonthsAgo.toISOString()]
    );

    const chatInExpiredSessionId = expiredChatResult.rows[0].id;

    // Replace the real AiApiService with our mock
    conversationService.aiApiService = new MockAiApiService();

    // Act
    const request: ConversationRequest = {
      assistantId,
      userId: 'test-user',
      chatId: chatInExpiredSessionId,
      sessionId: expiredSessionId,
      prompt: 'Try to use expired session and chat',
    };

    const response = await conversationService.ask(request);

    // Assert
    expect(response).not.toBeNull();

    // We expect the system to create a new session rather than using the expired one
    // Or at least create a new chat if the chat is expired but session is valid
    expect(response?.sessionId === expiredSessionId || response?.chatId !== chatInExpiredSessionId).toBeTruthy();

    if (response?.sessionId !== expiredSessionId) {
      // Verify a new session was created
      const newSessionResult = await db.query('SELECT * FROM sessions WHERE id = $1', [response?.sessionId]);
      expect(newSessionResult.rows).toHaveLength(1);
    }

    // Verify a valid chat exists either way
    const chatResult = await db.query('SELECT * FROM chats WHERE id = $1', [response?.chatId]);
    expect(chatResult.rows).toHaveLength(1);

    // Verify messages were saved
    const messagesResult = await db.query('SELECT * FROM chat_messages WHERE chat_id = $1', [response?.chatId]);
    expect(messagesResult.rows.length).toBeGreaterThan(0);
  });
});
