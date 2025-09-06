import { Route, Tags, Get, Put, Query, Body, Path, ValidateError } from 'tsoa';
import { MemoryExtraControllerService } from '../services/core-services/memory-extra.controller.service';
import { getDb } from '../database/database';
import { MemoryWithTags } from '../models/memory.model';
import { OrganizedMemoriesResponse } from '../services/sqlite-services/memory-extra.service';

@Route('memory-extra')
@Tags('MemoryExtra')
export class MemoryExtraController {
  private readonly memoryExtraService: MemoryExtraControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.memoryExtraService = new MemoryExtraControllerService(pool);
  }

  @Get('/with-tags')
  public async getMemoriesWithTags(): Promise<MemoryWithTags[]> {
    const memoriesWithTags = await this.memoryExtraService.getMemoriesWithTags();
    if (!memoriesWithTags || memoriesWithTags.length === 0) throw new ValidateError({}, 'No memories found.');
    return memoriesWithTags;
  }

  @Get('/by-tags')
  public async getMemoriesByTags(@Query() tags: string): Promise<MemoryWithTags[]> {
    if (!tags || typeof tags !== 'string') throw new ValidateError({}, 'Tags query parameter is required and should be a string.');
    const tagArray = tags.split(',');
    const memories = await this.memoryExtraService.getMemoriesByTags(tagArray);
    if (!memories || memories.length === 0) throw new ValidateError({}, 'No memories found for the provided tags.');
    return memories;
  }

  @Get('/organized')
  public async getOrganizedMemories(): Promise<OrganizedMemoriesResponse> {
    const memories = await this.memoryExtraService.getOrganizedMemories();
    if (!memories || (!memories.looseMemories.length && !memories.ownedMemories.length && !memories.focusedMemories.length)) {
      throw new ValidateError({}, 'No memories found.');
    }
    return memories;
  }

  @Put('/{memoryId}/tags')
  public async updateMemoryTags(@Path() memoryId: string, @Body() body: { newTags: string[] }): Promise<void> {
    const { newTags } = body;
    if (!newTags || !Array.isArray(newTags)) throw new ValidateError({}, 'New tags must be an array.');
    const isUpdated = await this.memoryExtraService.updateMemoryTags(memoryId, newTags);
    if (!isUpdated) throw new ValidateError({}, `Memory with ID ${memoryId} not found or update failed.`);
  }
}
