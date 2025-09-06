import { Route, Tags, Get, Post, Delete, Put, Path, ValidateError, Body, SuccessResponse } from 'tsoa';
import { FocusedMemoryControllerService } from '../services/core-services/memory-focused.controller.service';
import { getDb } from '../database/database';
import { MemoryWithTags } from '../models/memory.model';

@Route('memory-focused')
@Tags('MemoryFocused')
export class FocusedMemoryController {
  private readonly focusedMemoryService: FocusedMemoryControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.focusedMemoryService = new FocusedMemoryControllerService(pool);
  }

  @Get('/assistant/{assistantId}')
  public async getFocusedMemoriesByAssistantId(@Path() assistantId: string): Promise<MemoryWithTags[]> {
    const memories = await this.focusedMemoryService.getFocusedMemoriesByAssistantId(assistantId);
    if (!memories || memories.length === 0) throw new ValidateError({}, `No focused memories found for assistant with ID ${assistantId}.`);
    return memories;
  }

  @Get('/focus/{memoryFocusId}')
  public async getFocusedMemories(@Path() memoryFocusId: string): Promise<MemoryWithTags[]> {
    const memories = await this.focusedMemoryService.getFocusedMemories(memoryFocusId);
    if (!memories || memories.length === 0) throw new ValidateError({}, `No focused memories found for focus ID ${memoryFocusId}.`);
    return memories;
  }

  @Post('/focus/{memoryFocusId}/memory/{memoryId}')
  @SuccessResponse('201', 'Created')
  public async addFocusedMemory(@Path() memoryFocusId: string, @Path() memoryId: string): Promise<void> {
    const isAdded = await this.focusedMemoryService.addFocusedMemory(memoryFocusId, memoryId);
    if (!isAdded) throw new ValidateError({}, `Failed to add memory with ID ${memoryId} to focus group with ID ${memoryFocusId}.`);
  }

  @Delete('/focus/{memoryFocusId}/memory/{memoryId}')
  public async removeFocusedMemory(@Path() memoryFocusId: string, @Path() memoryId: string): Promise<void> {
    const isRemoved = await this.focusedMemoryService.removeFocusedMemory(memoryFocusId, memoryId);
    if (!isRemoved) throw new ValidateError({}, `Failed to remove memory with ID ${memoryId} from focus group with ID ${memoryFocusId}.`);
  }

  @Put('/focus/{memoryFocusId}')
  public async updateFocusedMemories(@Path() memoryFocusId: string, @Body() body: { memoryIds: string[] }): Promise<void> {
    const { memoryIds } = body;
    if (!Array.isArray(memoryIds)) throw new ValidateError({}, 'Memory IDs must be an array.');
    const isUpdated = await this.focusedMemoryService.updateFocusedMemories(memoryFocusId, memoryIds);
    if (!isUpdated) throw new ValidateError({}, `Failed to update focused memories for focus group with ID ${memoryFocusId}.`);
  }
}
