import { Route, Tags, Get, Post, Put, Delete, Path, Body, ValidateError, SuccessResponse } from 'tsoa';
import { MemoryFocusRuleControllerService } from '../services/core-services/memory-focus-rule.controller.service';
import { getDb } from '../database/database';
import { MemoryFocusRule } from '../models/focused-memory.model';

@Route('memory-focus-rule')
@Tags('MemoryFocusRule')
export class MemoryFocusRuleController {
  private readonly memoryFocusRuleService: MemoryFocusRuleControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.memoryFocusRuleService = new MemoryFocusRuleControllerService(pool);
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async createMemoryFocusRule(@Body() body: { assistantId: string; maxResults: number; relationshipTypes: string[]; priorityTags: string[] }): Promise<MemoryFocusRule> {
    const memoryFocusRule = await this.memoryFocusRuleService.createMemoryFocusRule(body.assistantId, body.maxResults, body.relationshipTypes, body.priorityTags);
    return memoryFocusRule;
  }

  @Get('/assistant/{assistantId}')
  public async getMemoryFocusRules(@Path() assistantId: string): Promise<MemoryFocusRule> {
    const memoryFocusRule = await this.memoryFocusRuleService.getMemoryFocusRules(assistantId);
    if (!memoryFocusRule) throw new ValidateError({}, `Memory focus rule for assistant with ID ${assistantId} not found.`);
    return memoryFocusRule;
  }

  @Get('/{ruleId}')
  public async getMemoryFocusRuleById(@Path() ruleId: string): Promise<MemoryFocusRule> {
    const memoryFocusRule = await this.memoryFocusRuleService.getMemoryFocusRuleById(ruleId);
    if (!memoryFocusRule) throw new ValidateError({}, `Memory focus rule with ID ${ruleId} not found.`);
    return memoryFocusRule;
  }

  @Put('/{id}')
  public async updateMemoryFocusRule(@Path() id: string, @Body() updates: MemoryFocusRule): Promise<void> {
    const isUpdated = await this.memoryFocusRuleService.updateMemoryFocusRule(id, updates);
    if (!isUpdated) throw new ValidateError({}, `Memory focus rule with ID ${id} not found or update failed.`);
  }

  @Delete('/{id}')
  public async removeMemoryFocusRule(@Path() id: string): Promise<void> {
    const isDeleted = await this.memoryFocusRuleService.removeMemoryFocusRule(id);
    if (!isDeleted) throw new ValidateError({}, `Memory focus rule with ID ${id} not found or delete failed.`);
  }
}
