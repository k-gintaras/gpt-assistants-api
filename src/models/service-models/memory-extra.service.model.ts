import { MemoryWithTags } from '../../models/memory.model';

export interface MemoryExtraServiceModel {
  getMemoriesWithTags(): Promise<MemoryWithTags[]>;
  getMemoriesByTags(tags: string[]): Promise<MemoryWithTags[]>;
  updateMemoryTags(memoryId: string, newTags: string[]): Promise<boolean>;
}
