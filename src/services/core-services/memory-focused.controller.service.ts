import { Pool } from 'pg';
import { MemoryWithTags } from '../../models/memory.model';
import { FocusedMemoryServiceModel } from '../../models/service-models/memory-focused.service';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';

export class FocusedMemoryControllerService implements FocusedMemoryServiceModel {
  focusedMemoryService: FocusedMemoryService;

  constructor(pool: Pool) {
    this.focusedMemoryService = new FocusedMemoryService(pool);
  }

  async getFocusedMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    return await this.focusedMemoryService.getLimitedFocusedMemoriesByAssistantId(assistantId);
  }

  async getFocusedMemories(memoryFocusId: string): Promise<MemoryWithTags[]> {
    return await this.focusedMemoryService.getAllFocusedMemoriesByRuleId(memoryFocusId);
  }

  async addFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    return await this.focusedMemoryService.addFocusedMemory(memoryFocusId, memoryId);
  }

  async removeFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    return await this.focusedMemoryService.removeFocusedMemory(memoryFocusId, memoryId);
  }

  async updateFocusedMemories(memoryFocusId: string, memoryIds: string[]): Promise<boolean> {
    return await this.focusedMemoryService.updateFocusedMemories(memoryFocusId, memoryIds);
  }
}
