import Database from 'better-sqlite3';
import { MemoryWithTags } from '../../models/memory.model';
import { MemoryExtraService } from '../sqlite-services/memory-extra.service';
import { MemoryExtraServiceModel } from '../../models/service-models/memory-extra.service.model';

export class MemoryExtraControllerService implements MemoryExtraServiceModel {
  memoryExtraService: MemoryExtraService;

  constructor(db: Database.Database) {
    this.memoryExtraService = new MemoryExtraService(db);
  }
  getAllMemories(): Promise<MemoryWithTags[]> {
    throw new Error('Method not implemented.');
  }

  getMemoriesWithTags(): Promise<MemoryWithTags[]> {
    return this.memoryExtraService.getAllMemoriesWithTags();
  }

  getMemoriesByTags(tags: string[]): Promise<MemoryWithTags[]> {
    return this.memoryExtraService.getMemoriesByTags(tags);
  }

  updateMemoryTags(memoryId: string, newTags: string[]): Promise<boolean> {
    return this.memoryExtraService.updateMemoryTags(memoryId, newTags);
  }
}
