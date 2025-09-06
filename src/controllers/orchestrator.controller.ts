import { Route, Tags, Post, Get, Body, Query, Path, ValidateError, SuccessResponse } from 'tsoa';
import { OrchestratorService } from '../services/orchestrator-services/orchestrator.service';
import { getDb } from '../database/database';
import { MemoryRequest, TaskRequest, TaskResponse, AssistantSuggestion, AssistantEvaluation, RelationshipType } from '../models/service-models/orchestrator.service.model';

@Route('orchestrator')
@Tags('Orchestrator')
export class OrchestratorController {
  private readonly orchestratorService: OrchestratorService;

  constructor() {
    const pool = getDb().getInstance();
    this.orchestratorService = new OrchestratorService(pool);
  }

  @Post('/remember')
  @SuccessResponse('201', 'Created')
  public async remember(@Body() body: { assistantId: string; memory: MemoryRequest; tags?: string[] }): Promise<void> {
    const success = await this.orchestratorService.remember(body.assistantId, body.memory, body.tags);
    if (!success) throw new ValidateError({}, 'Failed to store memory.');
  }

  @Post('/forget')
  @SuccessResponse('201', 'Created')
  public async forget(@Body() body: { assistantId: string; memoryId: string }): Promise<void> {
    const success = await this.orchestratorService.forget(body.assistantId, body.memoryId);
    if (!success) throw new ValidateError({}, 'Failed to forget memory.');
  }

  @Post('/delegate-task')
  public async delegateTask(@Body() body: { assistantId: string; task: TaskRequest; tags?: string[] }): Promise<TaskResponse> {
    const result = await this.orchestratorService.delegateTask(body.assistantId, body.task, body.tags);
    if (!result.success) throw new ValidateError({}, 'Task delegation failed.');
    return result;
  }

  @Post('/connect-assistants')
  public async connectAssistants(@Body() body: { primaryId: string; dependentId: string; relation: RelationshipType }): Promise<void> {
    const success = await this.orchestratorService.connectAssistants(body.primaryId, body.dependentId, body.relation);
    if (!success) throw new ValidateError({}, 'Failed to connect assistants.');
  }

  @Post('/connect-entities')
  public async connectEntities(@Body() body: { sourceType: 'assistant' | 'memory' | 'task'; sourceId: string; targetType: 'assistant' | 'memory' | 'task'; targetId: string; relation: RelationshipType }): Promise<void> {
    const success = await this.orchestratorService.connectEntities(body.sourceType, body.sourceId, body.targetType, body.targetId, body.relation);
    if (!success) throw new ValidateError({}, 'Failed to connect entities.');
  }

  @Get('/query-knowledge')
  public async queryKnowledge(@Query() query: string, @Query() assistantId?: string, @Query() tags?: string): Promise<string> {
    const tagsArray = tags ? tags.split(',') : undefined;
    const result = await this.orchestratorService.queryKnowledge(query, assistantId, tagsArray);
    if (!result) throw new ValidateError({}, 'No matching knowledge found.');
    return result;
  }

  @Post('/suggest-assistants')
  public async suggestAssistants(@Body() body: { task: TaskRequest; tags?: string[] }): Promise<AssistantSuggestion[]> {
    const suggestions = await this.orchestratorService.suggestAssistants(body.task, body.tags);
    if (!suggestions || suggestions.length === 0) throw new ValidateError({}, 'No assistant suggestions found.');
    return suggestions;
  }

  @Get('/evaluate-performance/{assistantId}')
  public async evaluatePerformance(@Path() assistantId: string): Promise<AssistantEvaluation> {
    const evaluation = await this.orchestratorService.evaluatePerformance(assistantId);
    if (!evaluation) throw new ValidateError({}, 'No performance data found.');
    return evaluation;
  }
}
