import Database from 'better-sqlite3';
import { MemoryServiceModel } from '../../models/service-models/memory.service.model';
import { MemoryService } from '../sqlite-services/memory.service';
import { Memory } from '../../models/memory.model';

export class MemoryControllerService implements MemoryServiceModel {
  memoryService: MemoryService;

  constructor(db: Database.Database) {
    this.memoryService = new MemoryService(db);
  }

  getMemories(): Memory[] | null {
    return this.memoryService.getAllMemories();
  }

  getMemory(id: string): Memory | null {
    return this.memoryService.getMemoryById(id);
  }

  createMemory(memory: Memory): string | null {
    return this.memoryService.addMemory(memory);
  }

  updateMemory(memory: Memory): boolean {
    return this.memoryService.updateMemory(memory.id, memory);
  }

  deleteMemory(id: string): boolean {
    return this.memoryService.removeMemory(id);
  }
}
