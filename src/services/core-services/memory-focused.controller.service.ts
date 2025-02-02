import Database from 'better-sqlite3';
import { MemoryWithTags } from '../../models/memory.model';
import { FocusedMemoryServiceModel } from '../../models/service-models/memory-focused.service';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';

export class FocusedMemoryControllerService implements FocusedMemoryServiceModel {
  focusedMemoryService: FocusedMemoryService;

  constructor(db: Database.Database) {
    this.focusedMemoryService = new FocusedMemoryService(db);
  }

  getFocusedMemoriesByAssistantId(assistantId: string): Promise<MemoryWithTags[]> {
    return this.focusedMemoryService.getLimitedFocusedMemoriesByAssistantId(assistantId);
  }

  getFocusedMemories(memoryFocusId: string): Promise<MemoryWithTags[]> {
    return this.focusedMemoryService.getAllFocusedMemoriesByRuleId(memoryFocusId);
  }

  addFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    return this.focusedMemoryService.addFocusedMemory(memoryFocusId, memoryId);
  }

  removeFocusedMemory(memoryFocusId: string, memoryId: string): Promise<boolean> {
    return this.focusedMemoryService.removeFocusedMemory(memoryFocusId, memoryId);
  }

  updateFocusedMemories(memoryFocusId: string, memoryIds: string[]): Promise<boolean> {
    return this.focusedMemoryService.updateFocusedMemories(memoryFocusId, memoryIds);
  }
}
