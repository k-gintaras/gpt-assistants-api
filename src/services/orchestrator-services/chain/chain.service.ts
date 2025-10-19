import { Pool } from 'pg';
import { generateUniqueId } from '../../sqlite-services/unique-id.service';
import { TaskService } from '../../sqlite-services/task.service';
import { RelationshipGraphService } from '../../sqlite-services/relationship-graph.service';
import { FullAssistantService } from '../../sqlite-services/assistant-full.service';
import { AiApiService } from '../../ai-api.service';
import { BroadcastChainInput, ChainOptions, ChainProgress } from '../../../models/chain.model';
import { Task } from '../../../models/task.model';

export class ChainService {
  taskService: TaskService;
  relationshipGraphService: RelationshipGraphService;
  assistantService: FullAssistantService;
  aiApiService: AiApiService;

  constructor(private pool: Pool) {
    this.taskService = new TaskService(pool);
    this.relationshipGraphService = new RelationshipGraphService(pool);
    this.assistantService = new FullAssistantService(pool);
    this.aiApiService = new AiApiService();
  }

  async planBroadcastChain(input: BroadcastChainInput) {
    if (!input.assistantIds?.length) {
      throw new Error('assistantIds cannot be empty');
    }
    if (!input.messages?.length) {
      throw new Error('messages cannot be empty');
    }
    const parentId = await this.taskService.addTask({
      description: input.description ?? 'Broadcast Chain',
      assignedAssistant: null,
      status: 'in_progress',
      inputData: JSON.stringify({ mode: 'broadcast', options: input.options }),
      outputData: null,
    });

    const childIds: string[] = [];
    for (let round = 0; round < input.messages.length; round++) {
      for (const assistantId of input.assistantIds) {
        const childId = await this.taskService.addTask({
          description: `Broadcast r${round} → assistant ${assistantId}`,
          assignedAssistant: assistantId,
          status: 'pending',
          inputData: JSON.stringify({ round, message: input.messages[round] }),
          outputData: null,
        });
        await this.relationshipGraphService.addRelationship({
          id: generateUniqueId(),
          sourceId: parentId,
          type: 'task',
          targetId: childId,
          relationshipType: 'subtask_of',
        });
        childIds.push(childId);
      }
    }

    return { parentId, childIds };
  }

  async runBroadcastChain(parentId: string, options: ChainOptions = {}) {
    const batchSize   = options.batchSize   ?? 5;
    const baseDelayMs = options.baseDelayMs ?? 250;
    const factor      = options.delayFactor ?? 2;
    const maxDelayMs  = options.maxDelayMs  ?? 2000;

    let delay = baseDelayMs;

    while (true) {
      // Get pending tasks that are subtasks of parentId
      const allPending = await this.taskService.getTasksByStatus('pending');
      const relevant = await this.filterTasksByParent(allPending, parentId);

      if (relevant.length === 0) {
        const allInProgress = await this.taskService.getTasksByStatus('in_progress');
        const relevantInProgress = await this.filterTasksByParent(allInProgress, parentId);
        if (relevantInProgress.length === 0) {
          // mark parent completed
          await this.taskService.updateTask(parentId, { status: 'completed' });
          break;
        }
        await new Promise(r => setTimeout(r, Math.min(delay, maxDelayMs)));
        delay = Math.min(delay * factor, maxDelayMs);
        continue;
      }

      // process in parallel, but small batch
      const batch = relevant.slice(0, batchSize);
      await Promise.all(batch.map(async task => {
        await this.processChainTask(task);
      }));

      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * factor, maxDelayMs);
    }
  }

  private async processChainTask(task: Task) {
    try {
      await this.taskService.updateTask(task.id, { status: 'in_progress' });
      const assistant = await this.assistantService.getFullAssistantWithDetailsEfficient(task.assignedAssistant!);
      if (!assistant) {
        throw new Error(`Assistant not found: ${task.assignedAssistant}`);
      }

      const aiApi = this.aiApiService.getAiApi(assistant.type);
      if (!aiApi?.isAvailable(assistant.type)) {
        throw new Error(`AI API is unavailable for assistant type: ${assistant.type}`);
      }

      // task.inputData may be stored as a string or as a parsed object depending on the DB driver.
      const inputData =
        typeof task.inputData === 'string'
          ? JSON.parse(task.inputData as string)
          : (task.inputData as unknown as { round: number; message: { role: string; content: string } });

      const request = {
        assistantData: assistant,
        prompt: inputData.message.content,
        memories: [], // Could be enhanced to include memories
        conversationId: null,
        conversationMessages: null,
      };

      const reply = await aiApi.ask(request);
      if (!reply) {
        throw new Error('AI API failed to return a response');
      }

      await this.taskService.updateTask(task.id, {
        status: 'completed',
        outputData: JSON.stringify({ reply: reply.response, responseType: reply.responseType }),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'unknown';
      await this.taskService.updateTask(task.id, {
        status: 'failed',
        outputData: JSON.stringify({ error: errorMessage }),
      });
    }
  }

  private async filterTasksByParent(tasks: Task[], parentId: string): Promise<Task[]> {
    const relationships = await this.relationshipGraphService.getRelationshipsBySource(parentId);
    const childIds = relationships
      .filter(rel => rel.relationshipType === 'subtask_of')
      .map(rel => rel.targetId);
    return tasks.filter(task => childIds.includes(task.id));
  }

  async getChainProgress(parentId: string): Promise<ChainProgress> {
    // Use integer math for compatibility with pg-mem and keep pct as an integer percentage
    // Note: pg-mem doesn't support FILTER clause, so we use SUM(CASE...) instead
    const query = `
      WITH children AS (
        SELECT rg.target_id AS task_id
        FROM relationship_graph rg
        WHERE rg.relationship_type = 'subtask_of'
          AND rg.type = 'task'
          AND rg.source_id = $1
      ),
      counts AS (
        SELECT
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS done,
          COUNT(*) AS total
        FROM tasks t
        JOIN children c ON c.task_id = t.id
      )
      SELECT COALESCE(done, 0) AS done, total, CASE WHEN total = 0 THEN 0 ELSE (COALESCE(done, 0) * 100 / total) END AS pct
      FROM counts;
    `;
    const result = await this.pool.query<{ done: number; total: number; pct: number }>(query, [parentId]);
    if (result.rows.length === 0) {
      return { done: 0, total: 0, pct: 0 };
    }
    return result.rows[0];
  }
}