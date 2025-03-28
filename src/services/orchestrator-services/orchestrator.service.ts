import { Pool } from 'pg';
import { AssistantEvaluation, AssistantSuggestion, MemoryRequest, OrchestratorServiceModel, RelationshipType, TaskRequest, TaskResponse } from '../../models/service-models/orchestrator.service.model';
import { RememberService } from './remember.service';
import { TaskDelegationService } from './task-delegation.service';
import { AssistantConnectionService } from './assistant-connection.service';
import { EntityConnectionService } from './entity-connection.service';
import { KnowledgeService } from './knowledge.service';
import { AssistantEvaluationService } from '../sqlite-services/assistant-evaluation.service';
import { AssistantSuggestionService } from '../sqlite-services/assistant-suggestion.service';
import { MemoryExtraService } from '../sqlite-services/memory-extra.service';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';
import { ForgetService } from './forget.service';

export class OrchestratorService implements OrchestratorServiceModel {
  pool: Pool;
  rememberService: RememberService;
  forgetService: ForgetService;
  taskDelegationService: TaskDelegationService;
  assistantConnectionService: AssistantConnectionService;
  entityConnectionService: EntityConnectionService;
  knowledgeService: KnowledgeService;
  assistantSuggestionService: AssistantSuggestionService;
  assistantEvaluationService: AssistantEvaluationService;

  constructor(pool: Pool) {
    this.pool = pool;
    this.rememberService = new RememberService(pool);
    this.forgetService = new ForgetService(pool);
    this.taskDelegationService = new TaskDelegationService(pool);
    this.assistantConnectionService = new AssistantConnectionService(pool);
    this.entityConnectionService = new EntityConnectionService(pool);
    this.assistantSuggestionService = new AssistantSuggestionService(pool);
    this.assistantEvaluationService = new AssistantEvaluationService(pool);

    const relationshipGraphService = new RelationshipGraphService(pool);
    const memoryExtraService = new MemoryExtraService(pool);
    this.knowledgeService = new KnowledgeService(memoryExtraService, relationshipGraphService);
  }

  /**
   * although is focused added, it is not really useful in the current implementation
   * because if we ask assistant to remember, it is highly likely to keep that in focused memories
   */
  async remember(assistantId: string, memory: MemoryRequest, tags?: string[]): Promise<boolean> {
    return await this.rememberService.remember(assistantId, memory, tags);
  }

  /**
   * unlike remember or remove from focused, it has to be basically disconnected from assistant (likely also removing tag, but lets keep it for later if we want to "restore")
   */
  async forget(assistantId: string, memoryId: string): Promise<boolean> {
    return await this.forgetService.forget(assistantId, memoryId);
  }

  async delegateTask(assistantId: string, task: TaskRequest, tags?: string[]): Promise<TaskResponse> {
    return await this.taskDelegationService.delegateTask(assistantId, task, tags);
  }

  async connectAssistants(primaryId: string, dependentId: string, relation: RelationshipType): Promise<boolean> {
    return await this.assistantConnectionService.connectAssistants(primaryId, dependentId, relation);
  }

  async connectEntities(sourceType: 'assistant' | 'memory' | 'task', sourceId: string, targetType: 'assistant' | 'memory' | 'task', targetId: string, relation: RelationshipType): Promise<boolean> {
    return await this.entityConnectionService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
  }

  async queryKnowledge(query: string, assistantId?: string, tags?: string[]): Promise<string | null> {
    return await this.knowledgeService.queryKnowledge(query, assistantId, tags);
  }

  async suggestAssistants(task: TaskRequest, tags?: string[]): Promise<AssistantSuggestion[]> {
    return await this.assistantSuggestionService.suggestAssistants(task, tags);
  }

  async evaluatePerformance(assistantId: string): Promise<AssistantEvaluation> {
    return await this.assistantEvaluationService.evaluatePerformance(assistantId);
  }
}
