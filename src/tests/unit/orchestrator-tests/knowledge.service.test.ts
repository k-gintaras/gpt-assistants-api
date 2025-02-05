/* eslint-disable @typescript-eslint/no-explicit-any */
import { KnowledgeService } from '../../../services/orchestrator-services/knowledge.service';
import { getDb } from '../test-db.helper';

describe('KnowledgeService', () => {
  let memoryExtraService: any;
  let relationshipGraphService: any;
  let knowledgeService: KnowledgeService;

  beforeAll(async () => {
    await getDb.initialize();
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(() => {
    memoryExtraService = {
      findDirectMemory: jest.fn(),
      findMultipleMemories: jest.fn(),
      getMemoriesByTags: jest.fn(),
      getMemoryById: jest.fn(),
    };

    relationshipGraphService = {
      getRelatedTopics: jest.fn(),
    };

    knowledgeService = new KnowledgeService(memoryExtraService, relationshipGraphService);
  });

  test('queryKnowledge returns direct memory if found', async () => {
    const memoryData = { description: 'Direct memory found', data: 'Direct data' };
    memoryExtraService.findDirectMemory.mockResolvedValue(memoryData);

    const result = await knowledgeService.queryKnowledge('query', 'assistant1', ['tag1']);
    expect(result).toBe('Direct memory found');
    expect(memoryExtraService.findDirectMemory).toHaveBeenCalledWith('query');
  });

  test('queryKnowledge returns memory by tags if direct memory not found', async () => {
    memoryExtraService.findDirectMemory.mockResolvedValue(null);
    memoryExtraService.getMemoriesByTags.mockResolvedValue([{ data: 'Tagged data' }]);

    const result = await knowledgeService.queryKnowledge('query', 'assistant1', ['tag1']);
    expect(result).toBe('Tagged data');
    expect(memoryExtraService.getMemoriesByTags).toHaveBeenCalledWith(['tag1']);
  });

  test('queryKnowledge returns memory by relationships if direct and tag search fail', async () => {
    memoryExtraService.findDirectMemory.mockResolvedValue(null);
    memoryExtraService.getMemoriesByTags.mockResolvedValue([]);
    relationshipGraphService.getRelatedTopics.mockResolvedValue(['memory123']);
    memoryExtraService.getMemoryById.mockResolvedValue({ description: 'Related memory', data: 'Related data' });

    const result = await knowledgeService.queryKnowledge('query', 'assistant1', ['tag1']);
    expect(result).toBe('Related memory');
    expect(relationshipGraphService.getRelatedTopics).toHaveBeenCalledWith('assistant1');
    expect(memoryExtraService.getMemoryById).toHaveBeenCalledWith('memory123');
  });

  test('queryKnowledge returns null if all searches fail', async () => {
    memoryExtraService.findDirectMemory.mockResolvedValue(null);
    memoryExtraService.getMemoriesByTags.mockResolvedValue([]);
    relationshipGraphService.getRelatedTopics.mockResolvedValue([]);

    const result = await knowledgeService.queryKnowledge('query', 'assistant1', ['tag1']);
    expect(result).toBeNull();
  });
});
