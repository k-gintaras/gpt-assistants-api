import { Pool } from 'pg';
import { MemoryWithTags } from '../../models/memory.model';
import { OwnedMemoryServiceModel } from '../../models/service-models/memory-owned.service.model';
import { OwnedMemoryService } from '../sqlite-services/owned-memory.service';

export class OwnedMemoryControllerService implements OwnedMemoryServiceModel {
  ownedMemoryService: OwnedMemoryService;

  constructor(pool: Pool) {
    this.ownedMemoryService = new OwnedMemoryService(pool);
  }

  async getMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    return await this.ownedMemoryService.getMemoriesByAssistantId(assistantId);
  }

  async getOwnedMemories(assistantId: string): Promise<MemoryWithTags[]> {
    return await this.ownedMemoryService.getOwnedMemories(assistantId);
  }

  async addOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    return await this.ownedMemoryService.addOwnedMemory(assistantId, memoryId);
  }

  async removeOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    return await this.ownedMemoryService.removeOwnedMemory(assistantId, memoryId);
  }

  async updateOwnedMemories(assistantId: string, memoryIds: string[]): Promise<boolean> {
    return await this.ownedMemoryService.updateOwnedMemories(assistantId, memoryIds);
  }
}
