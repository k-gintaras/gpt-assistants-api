import { Pool } from 'pg';
import { MemoryExtraService } from '../sqlite-services/memory-extra.service';

export class ForgetService {
  memoryService: MemoryExtraService;
  constructor(pool: Pool) {
    this.memoryService = new MemoryExtraService(pool);
  }

  forget(assistantId: string, memoryId: string): Promise<boolean> {
    return this.memoryService.forgetMemory(assistantId, memoryId);
  }
}
