import { getDb } from '../test-db.helper';
import { MemoryTransformerService } from '../../../services/memory-transformer.service';
import { generateChatReply } from '../../../services/gpt-api/gpt-api-chat-completion';
import { queryAssistantWithMessages } from '../../../services/gpt-api/gpt-api-thread';
import { AssistantRow } from '../../../models/assistant.model';
import { MemoryWithTags } from '../../../models/memory.model';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import { PromptService } from '../../../services/orchestrator-services/prompt.service';
import { AssistantService } from '../../../services/sqlite-services/assistant.service';
import { FocusedMemoryService } from '../../../services/sqlite-services/focused-memory.service';

jest.mock('../../../services/sqlite-services/assistant.service');
jest.mock('../../../services/sqlite-services/focused-memory.service');
jest.mock('../../../services/memory-transformer.service');
jest.mock('../../../services/gpt-api/gpt-api-chat-completion');
jest.mock('../../../services/gpt-api/gpt-api-thread');

let db: Pool;
let promptService: PromptService;
let mockAssistantService: jest.Mocked<AssistantService>;
let mockMemoryService: jest.Mocked<FocusedMemoryService>;
let mockMemoryTransformer: jest.Mocked<MemoryTransformerService>;
const pId = 'promptId';
beforeAll(async () => {
  await getDb.initialize(); // Initialize the database only once before tests
  db = getDb.getInstance();
  promptService = new PromptService(db);

  mockAssistantService = promptService.assistantService as jest.Mocked<AssistantService>;
  mockMemoryService = promptService.memoryService as jest.Mocked<FocusedMemoryService>;
  mockMemoryTransformer = promptService.memoryTransformerService as jest.Mocked<MemoryTransformerService>;
});
beforeEach(async () => {
  // Insert required data
  await insertHelpers.insertAssistant(db, pId + '1', true);
  await insertHelpers.insertAssistant(db, pId + '2', true); // Adjusted: ensure this is inserted within the same setup

  // Start transaction for each test
  await db.query('BEGIN');
});

afterEach(async () => {
  await db.query('ROLLBACK'); // Rollback changes after each test to ensure isolation
});

afterAll(async () => {
  await getDb.close(); // Close the DB pool after all tests
});

describe('PromptService Tests', () => {
  describe('prompt', () => {
    it('should return null if the assistant does not exist', async () => {
      mockAssistantService.getAssistantById.mockResolvedValueOnce(null);

      const result = await promptService.prompt('invalid-id', 'Test prompt');

      expect(result).toBeNull();
      expect(mockAssistantService.getAssistantById).toHaveBeenCalledWith('invalid-id');
    });

    it('should handle chat prompt for chat-type assistant', async () => {
      const assistant: AssistantRow = { id: pId + '1', gpt_assistant_id: pId + '1', name: 'Chat Assistant', type: 'chat', model: 'gpt-4o', description: '', created_at: '', updated_at: '' };
      mockAssistantService.getAssistantById.mockResolvedValueOnce(assistant);
      jest.spyOn(promptService, 'handleChatPrompt').mockResolvedValueOnce('Chat response');

      const result = await promptService.prompt(pId + '1', 'Test prompt');

      expect(result).toBe('Chat response');
      expect(promptService.handleChatPrompt).toHaveBeenCalledWith(assistant, 'Test prompt', undefined);
    });

    it('should handle thread-based prompt for assistant-type assistant', async () => {
      const assistant: AssistantRow = { id: pId + '2', gpt_assistant_id: pId + '2', name: 'Chat Assistant', type: 'assistant', model: 'gpt-4o', description: '', created_at: '', updated_at: '' };
      mockAssistantService.getAssistantById.mockResolvedValueOnce(assistant);
      jest.spyOn(promptService, 'handleAssistantPrompt').mockResolvedValueOnce('Chat response');

      const result = await promptService.prompt(pId + '2', 'Test prompt');

      expect(result).toBe('Chat response');
      expect(promptService.handleAssistantPrompt).toHaveBeenCalledWith(assistant, 'Test prompt', undefined);
    });
  });

  describe('handleChatPrompt', () => {
    it('should generate a chat reply with user prompt and extra instruction', async () => {
      const assistant: AssistantRow = { id: pId + '1', gpt_assistant_id: pId + '1', name: 'Chat Assistant', type: 'chat', model: 'gpt-4o', description: '', created_at: '', updated_at: '' };
      const memories: MemoryWithTags[] = [{ id: pId + 'm1', type: 'instruction', tags: [], description: 'Memory 1', data: null, createdAt: null, updatedAt: null }];
      mockMemoryService.getLimitedFocusedMemoriesByAssistantId.mockResolvedValueOnce(memories);
      mockMemoryTransformer.getMessages.mockReturnValueOnce([{ role: 'system', content: 'Memory 1' }]);
      (generateChatReply as jest.Mock).mockResolvedValueOnce('Chat reply');

      const result = await promptService.handleChatPrompt(assistant, 'User prompt', 'Extra instruction');

      expect(result).toBe('Chat reply');
      expect(mockMemoryService.getLimitedFocusedMemoriesByAssistantId).toHaveBeenCalledWith(assistant.id);
      expect(mockMemoryTransformer.getMessages).toHaveBeenCalledWith(memories);
      expect(generateChatReply).toHaveBeenCalledWith(
        assistant.model,
        [
          { role: 'system', content: 'Memory 1' },
          { role: 'user', content: 'User prompt' },
          { role: 'system', content: 'Extra instruction' },
        ],
        { max_tokens: 400 }
      );
    });
  });

  describe('handleAssistantPrompt', () => {
    it('should query assistant with user prompt and no extra instruction', async () => {
      const assistant: AssistantRow = {
        id: '2',
        gpt_assistant_id: '2',
        name: 'Thread Assistant',
        type: 'assistant',
        model: 'gpt-4o',
        description: '',
        created_at: '',
        updated_at: '',
      };

      const memories: MemoryWithTags[] = [{ id: 'm1', type: 'knowledge', tags: [], description: 'Memory 1', data: null, createdAt: null, updatedAt: null }];

      mockMemoryService.getLimitedFocusedMemoriesByAssistantIdNoInstructions.mockResolvedValueOnce(memories);
      mockMemoryTransformer.getThreadMessages.mockReturnValueOnce([{ role: 'assistant', content: 'Memory 1' }]);
      (queryAssistantWithMessages as jest.Mock).mockResolvedValueOnce('Thread reply');

      const result = await promptService.handleAssistantPrompt(assistant, 'User prompt');

      expect(result).toBe('Thread reply');
      expect(mockMemoryService.getLimitedFocusedMemoriesByAssistantIdNoInstructions).toHaveBeenCalledWith(assistant.id);
      expect(mockMemoryTransformer.getThreadMessages).toHaveBeenCalledWith(expect.arrayContaining(memories), { includeTypes: ['knowledge', 'prompt', 'meta', 'session'] });
      expect(queryAssistantWithMessages).toHaveBeenCalledWith(assistant.id, [
        { role: 'assistant', content: 'Memory 1' },
        { role: 'user', content: 'User prompt' },
      ]);
    });

    it('should query assistant with user prompt and extra instruction', async () => {
      const assistant: AssistantRow = { id: '2', gpt_assistant_id: '2', name: 'Thread Assistant', type: 'assistant', model: 'gpt-4o', description: '', created_at: '', updated_at: '' };
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
