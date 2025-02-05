import { Memory } from '../memory.model';

export interface MemoryServiceModel {
  getMemories(): Promise<Memory[] | null>;
  getMemory(id: string): Promise<Memory | null>;
  createMemory(memory: Memory): Promise<string | null>;
  updateMemory(memory: Memory): Promise<boolean>;
  deleteMemory(id: string): Promise<boolean>;
}
