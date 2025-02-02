import { testDbHelper } from '../test-db.helper';
import Database from 'better-sqlite3';
import { PromptService } from '../../../services/orchestrator-services/prompt.service';
import { AssistantService } from '../../../services/sqlite-services/assistant.service';
import { FocusedMemoryService } from '../../../services/sqlite-services/focused-memory.service';
import { MemoryTransformerService } from '../../../services/memory-transformer.service';
import { generateChatReply } from '../../../services/gpt-api/gpt-api-chat-completion';
import { queryAssistantWithMessages } from '../../../services/gpt-api/gpt-api-thread';
import { AssistantRow } from '../../../models/assistant.model';
import { MemoryWithTags } from '../../../models/memory.model';
import { insertHelpers } from '../test-db-insert.helper';

jest.mock('../../../services/sqlite-services/assistant.service');
jest.mock('../../../services/sqlite-services/focused-memory.service');
jest.mock('../../../services/memory-transformer.service');
jest.mock('../../../services/gpt-api/gpt-api-chat-completion');
jest.mock('../../../services/gpt-api/gpt-api-thread');

let db: Database.Database;
let promptService: PromptService;
let mockAssistantService: jest.Mocked<AssistantService>;
let mockMemoryService: jest.Mocked<FocusedMemoryService>;
let mockMemoryTransformer: jest.Mocked<MemoryTransformerService>;

beforeEach(() => {
  db = testDbHelper.initialize();
  promptService = new PromptService(db);

  mockAssistantService = promptService.assistantService as jest.Mocked<AssistantService>;
  mockMemoryService = promptService.memoryService as jest.Mocked<FocusedMemoryService>;
  mockMemoryTransformer = promptService.memoryTransformerService as jest.Mocked<MemoryTransformerService>;

  insertHelpers.insertAssistant(db, '1', true);
  jest.clearAllMocks();
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('PromptService Tests', () => {
  describe('prompt', () => {
    it('should return null if the assistant does not exist', async () => {
      mockAssistantService.getAssistantById.mockReturnValueOnce(null);

      const result = await promptService.prompt('invalid-id', 'Test prompt');

      expect(result).toBeNull();
      expect(mockAssistantService.getAssistantById).toHaveBeenCalledWith('invalid-id');
    });

    it('should handle chat prompt for chat-type assistant', async () => {
      const assistant: AssistantRow = { id: '1', name: 'Chat Assistant', type: 'chat', model: 'gpt-4o', description: '', createdAt: '', updatedAt: '' };
      mockAssistantService.getAssistantById.mockReturnValueOnce(assistant);
      jest.spyOn(promptService, 'handleChatPrompt').mockResolvedValueOnce('Chat response');

      const result = await promptService.prompt('1', 'Test prompt');

      expect(result).toBe('Chat response');
      expect(promptService.handleChatPrompt).toHaveBeenCalledWith(assistant, 'Test prompt', undefined);
    });

    it('should handle thread-based prompt for assistant-type assistant', async () => {
      const assistant: AssistantRow = { id: '2', name: 'Thread Assistant', type: 'assistant', model: 'gpt-4o', description: '', createdAt: '', updatedAt: '' };
      mockAssistantService.getAssistantById.mockReturnValueOnce(assistant);
      jest.spyOn(promptService, 'prompt').mockResolvedValueOnce('Thread response');

      const result = await promptService.prompt('2', 'Test prompt');

      expect(result).toBe('Thread response');
      expect(promptService.prompt).toHaveBeenCalledWith(assistant.id, 'Test prompt');
    });
  });

  describe('handleChatPrompt', () => {
    it('should generate a chat reply with user prompt and extra instruction', async () => {
      const assistant: AssistantRow = { id: '1', name: 'Chat Assistant', type: 'chat', model: 'gpt-4o', description: '', createdAt: '', updatedAt: '' };
      const memories: MemoryWithTags[] = [{ id: 'm1', type: 'instruction', tags: [], description: 'Memory 1', data: null, createdAt: null, updatedAt: null }];
      mockMemoryService.getLimitedFocusedMemoriesByAssistantId.mockResolvedValueOnce(memories);
      mockMemoryTransformer.getMessages.mockReturnValueOnce([{ role: 'system', content: 'Memory 1' }]);
      (generateChatReply as jest.Mock).mockResolvedValueOnce('Chat reply');

      const result = await promptService.handleChatPrompt(assistant, 'User prompt', 'Extra instruction');

      expect(result).toBe('Chat reply');
      expect(mockMemoryService.getLimitedFocusedMemoriesByAssistantId).toHaveBeenCalledWith(assistant.id);
      expect(mockMemoryTransformer.getMessages).toHaveBeenCalledWith(memories);
      expect(generateChatReply).toHaveBeenCalledWith(assistant.model, [
        { role: 'system', content: 'Memory 1' },
        { role: 'user', content: 'User prompt' },
        { role: 'system', content: 'Extra instruction' },
      ]);
    });
  });

  describe('handleAssistantPrompt', () => {
    it('should query assistant with user prompt and no extra instruction', async () => {
      const assistant: AssistantRow = {
        id: '2',
        name: 'Thread Assistant',
        type: 'assistant',
        model: 'gpt-4o',
        description: '',
        createdAt: '',
        updatedAt: '',
      };

      // Expected memories returned by mockMemoryService
      const memories: MemoryWithTags[] = [
        {
          id: 'm1',
          type: 'knowledge',
          tags: [],
          description: 'Memory 1',
          data: null,
          createdAt: null,
          updatedAt: null,
        },
      ];

      // Mock responses
      mockMemoryService.getLimitedFocusedMemoriesByAssistantId.mockResolvedValueOnce(memories);
      mockMemoryTransformer.getThreadMessages.mockReturnValueOnce([{ role: 'assistant', content: 'Memory 1' }]);
      (queryAssistantWithMessages as jest.Mock).mockResolvedValueOnce('Thread reply');

      // Call the method under test
      const result = await promptService.handleAssistantPrompt(assistant, 'User prompt');

      // Assertions
      expect(result).toBe('Thread reply');

      // Ensure `getFocusedMemoriesByAssistantId` was called with correct arguments
      expect(mockMemoryService.getLimitedFocusedMemoriesByAssistantId).toHaveBeenCalledWith(assistant.id);

      // Adjusted expectation to match the received arguments (including `includeTypes`)
      expect(mockMemoryTransformer.getThreadMessages).toHaveBeenCalledWith(
        expect.arrayContaining(memories), // Ensures memories are included
        { includeTypes: ['knowledge', 'prompt', 'meta', 'session'] } // Ensure includeTypes is passed as well
      );

      // Ensure `queryAssistantWithMessages` was called with the correct messages
      expect(queryAssistantWithMessages).toHaveBeenCalledWith(assistant.id, [
        { role: 'assistant', content: 'Memory 1' },
        { role: 'user', content: 'User prompt' },
      ]);
    });

    it('should query assistant with user prompt and extra instruction', async () => {
      const assistant: AssistantRow = { id: '2', name: 'Thread Assistant', type: 'assistant', model: 'gpt-4o', description: '', createdAt: '', updatedAt: '' };
      const memories: MemoryWithTags[] = [];
      mockMemoryService.getLimitedFocusedMemoriesByAssistantId.mockResolvedValueOnce(memories);
      mockMemoryTransformer.getThreadMessages.mockReturnValueOnce([]);
      (queryAssistantWithMessages as jest.Mock).mockResolvedValueOnce('Thread reply with extra instruction');

      const result = await promptService.handleAssistantPrompt(assistant, 'User prompt', 'Extra instruction');

      expect(result).toBe('Thread reply with extra instruction');
      expect(queryAssistantWithMessages).toHaveBeenCalledWith(assistant.id, [{ role: 'user', content: 'User prompt' }], 'Extra instruction');
    });
  });
});
