import { Memory } from '../memory.model';

export interface MemoryServiceModel {
  getMemories(): Memory[] | null;
  getMemory(id: string): Memory | null;
  createMemory(memory: Memory): string | null;
  updateMemory(memory: Memory): boolean;
  deleteMemory(id: string): boolean;
}
