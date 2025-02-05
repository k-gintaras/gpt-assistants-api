import { Pool } from 'pg';
import { MemoryServiceModel } from '../../models/service-models/memory.service.model';
import { Memory } from '../../models/memory.model';
import { MemoryService } from '../sqlite-services/memory.service';

export class MemoryControllerService implements MemoryServiceModel {
  memoryService: MemoryService;

  constructor(pool: Pool) {
    this.memoryService = new MemoryService(pool);
  }

  async getMemories(): Promise<Memory[] | null> {
    return await this.memoryService.getAllMemories();
  }

  async getMemory(id: string): Promise<Memory | null> {
    return await this.memoryService.getMemoryById(id);
  }

  async createMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    return await this.memoryService.addMemory(memory);
  }

  async updateMemory(memory: Memory): Promise<boolean> {
    return await this.memoryService.updateMemory(memory.id, memory);
  }

  async deleteMemory(id: string): Promise<boolean> {
    return await this.memoryService.removeMemory(id);
  }
}
