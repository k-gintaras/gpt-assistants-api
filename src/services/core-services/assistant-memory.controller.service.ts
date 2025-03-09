import { Pool } from 'pg';
import { AssistantMemoryService, AssistantMemoryData } from '../sqlite-services/assistant-memory.service';

export class AssistantMemoryControllerService {
  private assistantMemoryService: AssistantMemoryService;

  constructor(pool: Pool) {
    this.assistantMemoryService = new AssistantMemoryService(pool);
  }

  /**
   * Fetch all categorized memories for an assistant.
   */
  async getAssistantMemories(assistantId: string): Promise<AssistantMemoryData | null> {
    try {
      return await this.assistantMemoryService.getAllAssistantMemories(assistantId);
    } catch (error) {
      console.error('Error fetching assistant memories:', error);
      return null;
    }
  }
}
