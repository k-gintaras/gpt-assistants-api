import { Route, Tags, Get, Post, Delete, Put, Path, ValidateError, Body, SuccessResponse } from 'tsoa';
import { OwnedMemoryControllerService } from '../services/core-services/memory-owned.controller.service';
import { getDb } from '../database/database';
import { MemoryWithTags } from '../models/memory.model';

@Route('memory-owned')
@Tags('MemoryOwned')
export class OwnedMemoryController {
  private readonly ownedMemoryService: OwnedMemoryControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.ownedMemoryService = new OwnedMemoryControllerService(pool);
  }

  @Get('/assistant/{assistantId}')
  public async getMemoriesByAssistantId(@Path() assistantId: string): Promise<MemoryWithTags[]> {
    const memories = await this.ownedMemoryService.getMemoriesByAssistantId(assistantId);
    if (!memories || memories.length === 0) throw new ValidateError({}, `No memories found for assistant with ID ${assistantId}.`);
    return memories;
  }

  @Get('/owned/{assistantId}')
  public async getOwnedMemories(@Path() assistantId: string): Promise<MemoryWithTags[]> {
    const memories = await this.ownedMemoryService.getOwnedMemories(assistantId);
    if (!memories || memories.length === 0) throw new ValidateError({}, `No owned memories found for assistant with ID ${assistantId}.`);
    return memories;
  }

  @Post('/assistant/{assistantId}/memory/{memoryId}')
  @SuccessResponse('201', 'Created')
  public async addOwnedMemory(@Path() assistantId: string, @Path() memoryId: string): Promise<void> {
    const isAdded = await this.ownedMemoryService.addOwnedMemory(assistantId, memoryId);
    if (!isAdded) throw new ValidateError({}, `Failed to add memory with ID ${memoryId} to assistant with ID ${assistantId}.`);
  }

  @Delete('/assistant/{assistantId}/memory/{memoryId}')
  public async removeOwnedMemory(@Path() assistantId: string, @Path() memoryId: string): Promise<void> {
    const isRemoved = await this.ownedMemoryService.removeOwnedMemory(assistantId, memoryId);
    if (!isRemoved) throw new ValidateError({}, `Failed to remove memory with ID ${memoryId} from assistant with ID ${assistantId}.`);
  }

  @Put('/assistant/{assistantId}')
  public async updateOwnedMemories(@Path() assistantId: string, @Body() body: { memoryIds: string[] }): Promise<void> {
    const { memoryIds } = body;
    if (!Array.isArray(memoryIds)) throw new ValidateError({}, 'Memory IDs must be an array.');
    const isUpdated = await this.ownedMemoryService.updateOwnedMemories(assistantId, memoryIds);
    if (!isUpdated) throw new ValidateError({}, `Failed to update owned memories for assistant with ID ${assistantId}.`);
  }
}
