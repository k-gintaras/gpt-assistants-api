/* eslint-disable @typescript-eslint/no-unused-vars */
import Database from 'better-sqlite3';
import { AssistantEvaluation, AssistantSuggestion, MemoryRequest, OrchestratorServiceModel, RelationshipType, TaskRequest, TaskResponse } from '../../models/service-models/orchestrator.service.model';
import { RememberService } from './remember.service';
import { TaskDelegationService } from './task-delegation.service';
import { AssistantConnectionService } from './assistant-connection.service';
import { EntityConnectionService } from './entity-connection.service';
import { KnowledgeService } from './knowledge.service';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';
import { MemoryExtraService } from '../sqlite-services/memory-extra.service';
import { AssistantSuggestionService } from '../sqlite-services/assistant-suggestion.service';
import { AssistantEvaluationService } from '../sqlite-services/assistant-evaluation.service';

export class OrchestratorService implements OrchestratorServiceModel {
  db: Database.Database;
  rememberService: RememberService;
  taskDelegationService: TaskDelegationService;
  assistantConnectionService: AssistantConnectionService;
  entityConnectionService: EntityConnectionService;
  knowledgeService: KnowledgeService;
  assistantSuggestionService: AssistantSuggestionService;
  assistantEvaluationService: AssistantEvaluationService;

  constructor(db: Database.Database) {
    this.db = db;
    this.rememberService = new RememberService(db);
    this.taskDelegationService = new TaskDelegationService(db);
    this.assistantConnectionService = new AssistantConnectionService(db);
    this.entityConnectionService = new EntityConnectionService(db);
    this.assistantSuggestionService = new AssistantSuggestionService(db);
    this.assistantEvaluationService = new AssistantEvaluationService(db);

    const relationshipGraphService = new RelationshipGraphService(db);
    const memoryExtraService = new MemoryExtraService(db);
    this.knowledgeService = new KnowledgeService(memoryExtraService, relationshipGraphService);
  }
  async remember(assistantId: string, memory: MemoryRequest, tags?: string[]): Promise<boolean> {
    return await this.rememberService.remember(assistantId, memory, tags);
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
