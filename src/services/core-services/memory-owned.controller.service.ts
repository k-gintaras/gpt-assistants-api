import Database from 'better-sqlite3';
import { MemoryWithTags } from '../../models/memory.model';
import { OwnedMemoryService } from '../sqlite-services/owned-memory.service';
import { OwnedMemoryServiceModel } from '../../models/service-models/memory-owned.service.model';

export class OwnedMemoryControllerService implements OwnedMemoryServiceModel {
  ownedMemoryService: OwnedMemoryService;

  constructor(db: Database.Database) {
    this.ownedMemoryService = new OwnedMemoryService(db);
  }

  getMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    return this.ownedMemoryService.getMemoriesByAssistantId(assistantId);
  }

  getOwnedMemories(assistantId: string): Promise<MemoryWithTags[]> {
    return this.ownedMemoryService.getOwnedMemories(assistantId);
  }

  addOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    return this.ownedMemoryService.addOwnedMemory(assistantId, memoryId);
  }

  removeOwnedMemory(assistantId: string, memoryId: string): Promise<boolean> {
    return this.ownedMemoryService.removeOwnedMemory(assistantId, memoryId);
  }

  updateOwnedMemories(assistantId: string, memoryIds: string[]): Promise<boolean> {
    return this.ownedMemoryService.updateOwnedMemories(assistantId, memoryIds);
  }
}
