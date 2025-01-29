import { MemoryWithTags } from '../../models/memory.model';

export interface FocusedMemoryServiceModel {
  getFocusedMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]>;
  getFocusedMemories(memoryFocusId: string): Promise<MemoryWithTags[]>;
  addFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean>;
  removeFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean>;
  updateFocusedMemories(memoryFocusId: string, memoryIds: string[]): Promise<boolean>;
}
