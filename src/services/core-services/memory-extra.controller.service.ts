import { Pool } from 'pg';
import { MemoryWithTags } from '../../models/memory.model';
import { MemoryExtraServiceModel } from '../../models/service-models/memory-extra.service.model';
import { MemoryExtraService } from '../sqlite-services/memory-extra.service';

export class MemoryExtraControllerService implements MemoryExtraServiceModel {
  memoryExtraService: MemoryExtraService;

  constructor(pool: Pool) {
    this.memoryExtraService = new MemoryExtraService(pool);
  }

  async getMemoriesWithTags(): Promise<MemoryWithTags[]> {
    return await this.memoryExtraService.getAllMemoriesWithTags();
  }

  async getMemoriesByTags(tags: string[]): Promise<MemoryWithTags[]> {
    return await this.memoryExtraService.getMemoriesByTags(tags);
  }

  async updateMemoryTags(memoryId: string, newTags: string[]): Promise<boolean> {
    return await this.memoryExtraService.updateMemoryTags(memoryId, newTags);
  }
}
