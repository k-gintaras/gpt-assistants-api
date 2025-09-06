import { Route, Tags, Get, Post, Put, Delete, Path, Body, ValidateError, SuccessResponse } from 'tsoa';
import { MemoryControllerService } from '../services/core-services/memory.controller.service';
import { getDb } from '../database/database';
import { Memory } from '../models/memory.model';

@Route('memory')
@Tags('Memory')
export class MemoryController {
  private readonly memoryService: MemoryControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.memoryService = new MemoryControllerService(pool);
  }

  @Get('/')
  public async getMemories(): Promise<Memory[]> {
    const memories = await this.memoryService.getMemories();
    if (!memories || memories.length === 0) throw new ValidateError({}, 'No memories found.');
    return memories;
  }

  @Get('/{id}')
  public async getMemory(@Path() id: string): Promise<Memory> {
    const memory = await this.memoryService.getMemory(id);
    if (!memory) throw new ValidateError({}, `Memory with ID ${id} not found.`);
    return memory;
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async createMemory(@Body() memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const memoryId = await this.memoryService.createMemory(memory);
    if (!memoryId) throw new ValidateError({}, 'Failed to create memory.');
    return { id: memoryId };
  }

  @Put('/{id}')
  public async updateMemory(@Path() id: string, @Body() memory: Memory): Promise<void> {
    if (memory.id !== id) throw new ValidateError({}, 'Memory ID mismatch.');
    const isUpdated = await this.memoryService.updateMemory(memory);
    if (!isUpdated) throw new ValidateError({}, `Memory with ID ${id} not found or update failed.`);
  }

  @Delete('/{id}')
  public async deleteMemory(@Path() id: string): Promise<void> {
    const isDeleted = await this.memoryService.deleteMemory(id);
    if (!isDeleted) throw new ValidateError({}, `Memory with ID ${id} not found or delete failed.`);
  }
}
