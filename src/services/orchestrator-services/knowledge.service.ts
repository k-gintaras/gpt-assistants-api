import { Memory } from '../../models/memory.model';
import { MemoryExtraService } from '../sqlite-services/memory-extra.service';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';

export class KnowledgeService {
  constructor(private memoryExtraService: MemoryExtraService, private relationshipGraphService: RelationshipGraphService) {}

  async queryKnowledge(request: string, assistantId?: string, tags?: string[]): Promise<string | null> {
    // Step 1: Direct search in memories
    let knowledge = await this.findDirectMemory(request);
    if (knowledge) return knowledge;

    // Step 2: Search by tags (if provided)
    if (tags && tags.length > 0) {
      knowledge = await this.findMemoryByTags(tags);
      if (knowledge) return knowledge;
    }

    // Priority 3: Expand search via relationships if an assistant ID is available
    if (assistantId) {
      knowledge = await this.findMemoryByRelationships(assistantId);
      if (knowledge) return knowledge;
    }
    return null;
  }

  private async findDirectMemory(query: string): Promise<string | null> {
    const memoryWithTags: Memory | null = await this.memoryExtraService.findDirectMemory(query);
    return memoryWithTags ? memoryWithTags.description || memoryWithTags.data : null;
  }

  private async findMultipleDirectMemory(query: string): Promise<string[] | null> {
    const memoryWithTags: string[] | null = await this.memoryExtraService.findMultipleMemories(query);
    return memoryWithTags;
  }

  private async findMemoryByTags(tags: string[]): Promise<string | null> {
    try {
      const memoriesWithTags = await this.memoryExtraService.getMemoriesByTags(tags);

      if (!memoriesWithTags || memoriesWithTags.length === 0) {
        return null; // No relevant memory found
      }

      // Return the most recent memory (or refine this selection logic later)
      return memoriesWithTags[0].data || null;
    } catch (error) {
      console.error('Error in findMemoryByTags:', error);
      return null;
    }
  }

  private async findMultipleMemoriesByTags(tags: string[], limit = 3): Promise<string[]> {
    try {
      const memoriesWithTags = await this.memoryExtraService.getMemoriesByTags(tags);
      if (!memoriesWithTags || memoriesWithTags.length === 0) return [];

      return memoriesWithTags.slice(0, limit).map((mem) => mem.data || '');
    } catch (error) {
      console.error('Error in findMultipleMemoriesByTags:', error);
      return [];
    }
  }

  private async findMemoryByRelationships(relationshipSourceId: string): Promise<string | null> {
    // Use relationship graph to find related knowledge
    const relatedTopicIds = await this.relationshipGraphService.getRelatedTopics(relationshipSourceId);
    if (!relatedTopicIds || relatedTopicIds.length === 0) return null;

    // Fetch the most relevant memory by ID
    const relatedMemory = await this.memoryExtraService.getMemoryById(relatedTopicIds[0]);
    return relatedMemory ? relatedMemory.description || relatedMemory.data : null;
  }
}
