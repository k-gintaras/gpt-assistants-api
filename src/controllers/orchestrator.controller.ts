import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import { respond } from './controller.helper';
import { OrchestratorService } from '../services/orchestrator-services/orchestrator.service';

export class OrchestratorController {
  private orchestratorService: OrchestratorService;

  constructor(db: Database.Database) {
    this.orchestratorService = new OrchestratorService(db);
  }

  /**
   * Store a memory for an assistant.
   * @requestBody { assistantId: string, memory: MemoryRequest, tags?: string[] } The assistant ID, memory data, and optional tags.
   * @response {201} { status: "success", message: "Memory stored successfully." }
   * @response {400} { status: "error", message: "Failed to store memory." }
   * @response {500} { status: "error", message: "Error storing memory.", error: any }
   */
  async remember(req: Request, res: Response) {
    const { assistantId, memory, tags } = req.body;
    try {
      const success = await this.orchestratorService.remember(assistantId, memory, tags);
      return success ? respond(res, 201, 'Memory stored successfully.') : respond(res, 400, 'Failed to store memory.');
    } catch (error) {
      return respond(res, 500, 'Error storing memory.', null, error);
    }
  }

  /**
   * Delegate a task to an assistant.
   * @requestBody { assistantId: string, task: TaskRequest, tags?: string[] } The assistant ID, task details, and optional tags.
   * @response {200} { status: "success", message: "Task delegated successfully.", data: TaskResponse }
   * @response {400} { status: "error", message: "Task delegation failed.", error: any }
   * @response {500} { status: "error", message: "Error delegating task.", error: any }
   */
  async delegateTask(req: Request, res: Response) {
    const { assistantId, task, tags } = req.body;
    try {
      const result = await this.orchestratorService.delegateTask(assistantId, task, tags);
      return result.success ? respond(res, 200, 'Task delegated successfully.', result) : respond(res, 400, 'Task delegation failed.', result);
    } catch (error) {
      return respond(res, 500, 'Error delegating task.', null, error);
    }
  }

  /**
   * Connect two assistants.
   * @requestBody { primaryId: string, dependentId: string, relation: string } The assistant IDs and their relationship type.
   * @response {200} { status: "success", message: "Assistants connected successfully." }
   * @response {400} { status: "error", message: "Failed to connect assistants." }
   * @response {500} { status: "error", message: "Error connecting assistants.", error: any }
   */
  async connectAssistants(req: Request, res: Response) {
    const { primaryId, dependentId, relation } = req.body;
    try {
      const success = await this.orchestratorService.connectAssistants(primaryId, dependentId, relation);
      return success ? respond(res, 200, 'Assistants connected successfully.') : respond(res, 400, 'Failed to connect assistants.');
    } catch (error) {
      return respond(res, 500, 'Error connecting assistants.', null, error);
    }
  }

  /**
   * Connect any two entities (assistant, memory, task).
   * @requestBody { sourceType: string, sourceId: string, targetType: string, targetId: string, relation: string } The entity types, IDs, and relationship type.
   * @response {200} { status: "success", message: "Entities connected successfully." }
   * @response {400} { status: "error", message: "Failed to connect entities." }
   * @response {500} { status: "error", message: "Error connecting entities.", error: any }
   */
  async connectEntities(req: Request, res: Response) {
    const { sourceType, sourceId, targetType, targetId, relation } = req.body;
    try {
      const success = await this.orchestratorService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
      return success ? respond(res, 200, 'Entities connected successfully.') : respond(res, 400, 'Failed to connect entities.');
    } catch (error) {
      return respond(res, 500, 'Error connecting entities.', null, error);
    }
  }

  /**
   * Query knowledge from an assistant’s knowledge base.
   * @requestQuery { query: string, assistantId?: string, tags?: string[] } The query text, optional assistant ID, and optional tags for filtering.
   * @response {200} { status: "success", message: "Knowledge fetched successfully.", data: string }
   * @response {404} { status: "error", message: "No matching knowledge found." }
   * @response {500} { status: "error", message: "Error querying knowledge.", error: any }
   */
  async queryKnowledge(req: Request, res: Response) {
    const query = req.query.query as string;
    const assistantId = req.query.assistantId as string | undefined;
    let tags: string[] | undefined = undefined;
    if (req.query.tags) {
      tags = typeof req.query.tags === 'string' ? req.query.tags.split(',') : (req.query.tags as string[]);
    }
    if (!query) return respond(res, 400, 'Query parameter is required.');
    try {
      const result = await this.orchestratorService.queryKnowledge(query, assistantId, tags);
      return result ? respond(res, 200, 'Knowledge fetched successfully.', result) : respond(res, 404, 'No matching knowledge found.');
    } catch (error) {
      return respond(res, 500, 'Error querying knowledge.', null, error);
    }
  }

  /**
   * Suggest assistants suited for a task.
   * @requestBody { task: TaskRequest, tags?: string[] } The task details and optional tags.
   * @response {200} { status: "success", message: "Assistant suggestions fetched successfully.", data: AssistantSuggestion[] }
   * @response {404} { status: "error", message: "No assistant suggestions found." }
   * @response {500} { status: "error", message: "Error fetching assistant suggestions.", error: any }
   */
  async suggestAssistants(req: Request, res: Response) {
    const { task, tags } = req.body;

    try {
      const suggestions = await this.orchestratorService.suggestAssistants(task, tags);
      return suggestions && suggestions.length > 0 ? respond(res, 200, 'Assistant suggestions fetched successfully.', suggestions) : respond(res, 404, 'No assistant suggestions found.');
    } catch (error) {
      return respond(res, 500, 'Error fetching assistant suggestions.', null, error);
    }
  }

  /**
   * Evaluate an assistant's performance.
   * @requestParams { assistantId: string } The ID of the assistant to evaluate.
   * @response {200} { status: "success", message: "Performance evaluated successfully.", data: AssistantEvaluation }
   * @response {404} { status: "error", message: "No performance data found." }
   * @response {500} { status: "error", message: "Error evaluating performance.", error: any }
   */
  async evaluatePerformance(req: Request, res: Response) {
    const { assistantId } = req.params;
    try {
      const evaluation = await this.orchestratorService.evaluatePerformance(assistantId);
      return evaluation ? respond(res, 200, 'Performance evaluated successfully.', evaluation) : respond(res, 404, 'No performance data found.');
    } catch (error) {
      return respond(res, 500, 'Error evaluating performance.', null, error);
    }
  }
}
