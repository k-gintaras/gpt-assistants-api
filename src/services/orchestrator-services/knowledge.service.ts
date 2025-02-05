import { MemoryExtraService } from '../sqlite-services/memory-extra.service';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';

export class KnowledgeService {
  constructor(private memoryExtraService: MemoryExtraService, private relationshipGraphService: RelationshipGraphService) {}

  async queryKnowledge(request: string, assistantId?: string, tags?: string[]): Promise<string | null> {
    let knowledge = await this.findDirectMemory(request);
    if (knowledge) return knowledge;

    if (tags && tags.length > 0) {
      knowledge = await this.findMemoryByTags(tags);
      if (knowledge) return knowledge;
    }

    if (assistantId) {
      knowledge = await this.findMemoryByRelationships(assistantId);
      if (knowledge) return knowledge;
    }
    return null;
  }

  private async findDirectMemory(query: string): Promise<string | null> {
    const memoryWithTags = await this.memoryExtraService.findDirectMemory(query);
    return memoryWithTags ? memoryWithTags.description || memoryWithTags.data : null;
  }

  private async findMemoryByTags(tags: string[]): Promise<string | null> {
    try {
      const memoriesWithTags = await this.memoryExtraService.getMemoriesByTags(tags);
      if (!memoriesWithTags || memoriesWithTags.length === 0) {
        return null;
      }
      return memoriesWithTags[0].data || null;
    } catch (error) {
      console.error('Error in findMemoryByTags:', error);
      return null;
    }
  }

  private async findMemoryByRelationships(relationshipSourceId: string): Promise<string | null> {
    const relatedTopicIds = await this.relationshipGraphService.getRelatedTopics(relationshipSourceId);
    if (!relatedTopicIds || relatedTopicIds.length === 0) return null;

    const relatedMemory = await this.memoryExtraService.getMemoryById(relatedTopicIds[0]);
    return relatedMemory ? relatedMemory.description || relatedMemory.data : null;
  }
}
