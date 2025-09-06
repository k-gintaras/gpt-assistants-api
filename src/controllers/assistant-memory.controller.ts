import { Get, Route, Tags, Path, ValidateError } from 'tsoa';
import { AssistantMemoryControllerService } from '../services/core-services/assistant-memory.controller.service';
import { getDb } from '../database/database';
import { AssistantMemoryData } from '../services/sqlite-services/assistant-memory.service';

@Route('assistant-memory')
@Tags('AssistantMemory')
export class AssistantMemoryController {
  private assistantMemoryService: AssistantMemoryControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.assistantMemoryService = new AssistantMemoryControllerService(pool);
  }

  @Get('/{id}')
  public async getAssistantMemories(@Path() id: string): Promise<AssistantMemoryData> {
    const memories = await this.assistantMemoryService.getAssistantMemories(id);
    if (!memories || (
      memories.focused.length === 0 &&
      memories.owned.length === 0 &&
      memories.related.length === 0
    )) {
      throw new ValidateError({}, `No memories found for assistant ${id}.`);
    }
    return memories;
  }
}
