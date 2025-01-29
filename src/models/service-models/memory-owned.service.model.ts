import { MemoryWithTags } from '../../models/memory.model';

export interface OwnedMemoryServiceModel {
  getMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]>;
  getOwnedMemories(assistantId: string): Promise<MemoryWithTags[]>;
  addOwnedMemory(assistantId: string, memoryId: string): Promise<boolean>;
  removeOwnedMemory(assistantId: string, memoryId: string): Promise<boolean>;
  updateOwnedMemories(assistantId: string, memoryIds: string[]): Promise<boolean>;
}
