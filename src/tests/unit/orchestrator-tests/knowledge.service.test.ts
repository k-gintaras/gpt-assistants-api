/* eslint-disable @typescript-eslint/no-explicit-any */
import { KnowledgeService } from '../../../services/orchestrator-services/knowledge.service';

describe('KnowledgeService', () => {
  let memoryExtraService: any;
  let relationshipGraphService: any;
  let knowledgeService: KnowledgeService;

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
    // Simulate no direct memory found.
    memoryExtraService.findDirectMemory.mockResolvedValue(null);
    // Return an array with one memory having data.
    memoryExtraService.getMemoriesByTags.mockResolvedValue([{ data: 'Tagged data' }]);

    const result = await knowledgeService.queryKnowledge('query', 'assistant1', ['tag1']);
    expect(result).toBe('Tagged data');
    expect(memoryExtraService.getMemoriesByTags).toHaveBeenCalledWith(['tag1']);
  });

  test('queryKnowledge returns memory by relationships if direct and tag search fail', async () => {
    // No direct memory.
    memoryExtraService.findDirectMemory.mockResolvedValue(null);
    // Tag search yields empty.
    memoryExtraService.getMemoriesByTags.mockResolvedValue([]);
    // Relationship graph returns a related memory ID.
    relationshipGraphService.getRelatedTopics.mockResolvedValue(['memory123']);
    // Fetching the related memory returns one with a description.
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
