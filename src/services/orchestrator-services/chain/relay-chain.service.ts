import { Pool } from 'pg';
import { generateUniqueId } from '../../sqlite-services/unique-id.service';
import { TaskService } from '../../sqlite-services/task.service';
import { RelationshipGraphService } from '../../sqlite-services/relationship-graph.service';
import { FullAssistantService } from '../../sqlite-services/assistant-full.service';
import { AiApiService } from '../../ai-api.service';
import { RelayChainInput, ChainOptions, RelayChainProgress } from '../../../models/chain.model';
import { Task } from '../../../models/task.model';

export class RelayChainService {
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

  /**
   * Simple template helper - replaces {{key}} with context[key]
   */
  private applyTemplate(template: string, context: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, k) => String(context[k] ?? ''));
  }

  /**
   * Plan a relay chain: create parent task and ordered step tasks with dependencies
   */
  async planRelayChain(input: RelayChainInput) {
    if (!input.steps?.length) {
      throw new Error('steps cannot be empty');
    }

    const parentId = await this.taskService.addTask({
      description: input.description ?? 'Relay Chain',
      assignedAssistant: null,
      status: 'in_progress',
      inputData: JSON.stringify({ mode: 'relay', steps: input.steps }),
      outputData: null,
    });

    const stepIds: string[] = [];
    let prevTaskId: string | null = null;

    for (let i = 0; i < input.steps.length; i++) {
      const step = input.steps[i];
      const stepId = await this.taskService.addTask({
        description: `Relay step ${i} → assistant ${step.assistantId}`,
        assignedAssistant: step.assistantId,
        status: 'pending',
        inputData: JSON.stringify({ stepIndex: i, messageTemplate: step.messageTemplate }),
        outputData: null,
      });

      // Create subtask_of relationship to parent
      await this.relationshipGraphService.addRelationship({
        id: generateUniqueId(),
        sourceId: parentId,
        type: 'task',
        targetId: stepId,
        relationshipType: 'subtask_of',
      });

      // Create dependency on previous step
      if (prevTaskId) {
        // Current step depends on previous step
        await this.relationshipGraphService.addRelationship({
          id: generateUniqueId(),
          sourceId: stepId,
          type: 'task',
          targetId: prevTaskId,
          relationshipType: 'depends_on',
        });
        // Previous step blocks current step
        await this.relationshipGraphService.addRelationship({
          id: generateUniqueId(),
          sourceId: prevTaskId,
          type: 'task',
          targetId: stepId,
          relationshipType: 'blocks',
        });
      }

      stepIds.push(stepId);
      prevTaskId = stepId;
    }

    return { parentId, stepIds };
  }

  /**
   * Run relay chain - execute steps in order based on dependencies
   */
  async runRelayChain(parentId: string, options: ChainOptions = {}) {
    const baseDelayMs = options.baseDelayMs ?? 250;
    const factor      = options.delayFactor ?? 2;
    const maxDelayMs  = options.maxDelayMs ?? 2000;
    let delay = baseDelayMs;

    while (true) {
      // Get all pending tasks for this chain
      const allPending = await this.taskService.getTasksByStatus('pending');
      const relaySteps = await this.filterTasksByParent(allPending, parentId);

      // Find the first executable step (all dependencies completed)
      const executable = await this.findFirstExecutable(relaySteps);

      if (!executable) {
        const allInProgress = await this.taskService.getTasksByStatus('in_progress');
        const relevantInProgress = await this.filterTasksByParent(allInProgress, parentId);

        if (relevantInProgress.length === 0 && relaySteps.length === 0) {
          // All steps completed
          await this.taskService.updateTask(parentId, { status: 'completed' });
          break;
        }

        // Wait and retry with backoff
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * factor, maxDelayMs);
        continue;
      }

      // Process the executable step
      const success = await this.processRelayStep(executable);

      if (!success) {
        // Fail the parent task if a step fails
        await this.taskService.updateTask(parentId, { status: 'failed' });
        break;
      }

      // Reset delay on successful processing
      await new Promise(r => setTimeout(r, baseDelayMs));
      delay = baseDelayMs;
    }
  }

  /**
   * Find the first step whose dependencies are all completed
   */
  private async findFirstExecutable(tasks: Task[]): Promise<Task | null> {
    for (const task of tasks) {
      const isExecutable = await this.areAllDependenciesCompleted(task.id);
      if (isExecutable) {
        return task;
      }
    }
    return null;
  }

  /**
   * Check if all dependencies for a task are completed
   */
  private async areAllDependenciesCompleted(taskId: string): Promise<boolean> {
    const relationships = await this.relationshipGraphService.getRelationshipsBySource(taskId);
    const dependencies = relationships.filter(rel => rel.relationshipType === 'depends_on');

    for (const dep of dependencies) {
      const depTask = await this.taskService.getTaskById(dep.targetId);
      if (!depTask || depTask.status !== 'completed') {
        return false;
      }
    }

    return true;
  }

  /**
   * Get the previous step task (that this task depends on)
   */
  private async getPreviousStep(taskId: string): Promise<Task | null> {
    const relationships = await this.relationshipGraphService.getRelationshipsBySource(taskId);
    const dependency = relationships.find(rel => rel.relationshipType === 'depends_on');

    if (!dependency) {
      return null;
    }

    return await this.taskService.getTaskById(dependency.targetId);
  }

  /**
   * Process a single relay step
   */
  private async processRelayStep(task: Task): Promise<boolean> {
    try {
      await this.taskService.updateTask(task.id, { status: 'in_progress' });

      // Get previous step's output
      const prevStep = await this.getPreviousStep(task.id);
      let prevOutput = '';
      if (prevStep && prevStep.outputData) {
        const outputData = typeof prevStep.outputData === 'string'
          ? JSON.parse(prevStep.outputData)
          : prevStep.outputData;
        prevOutput = outputData.reply ?? '';
      }

      // Parse input data
      const inputData = typeof task.inputData === 'string'
        ? JSON.parse(task.inputData)
        : (task.inputData ?? {}) as { stepIndex: number; messageTemplate: string };

      // Apply template with previous output
      const message = this.applyTemplate(inputData.messageTemplate, { prev_reply: prevOutput });

      // Get assistant
      const assistant = await this.assistantService.getFullAssistantWithDetailsEfficient(task.assignedAssistant!);
      if (!assistant) {
        throw new Error(`Assistant not found: ${task.assignedAssistant}`);
      }

      // Get AI API
      const aiApi = this.aiApiService.getAiApi(assistant.type);
      if (!aiApi?.isAvailable(assistant.type)) {
        throw new Error(`AI API is unavailable for assistant type: ${assistant.type}`);
      }

      // Make the request
      const request = {
        assistantData: assistant,
        prompt: message,
        memories: [],
        conversationId: null,
        conversationMessages: null,
      };

      const reply = await aiApi.ask(request);
      if (!reply) {
        throw new Error('AI API failed to return a response');
      }

      // Update task with output
      await this.taskService.updateTask(task.id, {
        status: 'completed',
        outputData: JSON.stringify({
          reply: reply.response,
          responseType: reply.responseType,
          injectedFrom: prevStep?.id ?? null,
          promptEcho: message,
        }),
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'unknown';
      await this.taskService.updateTask(task.id, {
        status: 'failed',
        outputData: JSON.stringify({ error: errorMessage }),
      });
      return false;
    }
  }

  /**
   * Filter tasks to only those that are subtasks of the given parent
   */
  private async filterTasksByParent(tasks: Task[], parentId: string): Promise<Task[]> {
    const relationships = await this.relationshipGraphService.getRelationshipsBySource(parentId);
    const childIds = relationships
      .filter(rel => rel.relationshipType === 'subtask_of')
      .map(rel => rel.targetId);
    return tasks.filter(task => childIds.includes(task.id));
  }

  /**
   * Get relay chain progress with ordered step tracking
   */
  async getRelayChainProgress(parentId: string): Promise<RelayChainProgress> {
    // Get progress counts
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
      SELECT COALESCE(done, 0) AS done, total
      FROM counts;
    `;
    const result = await this.pool.query<{ done: number; total: number }>(query, [parentId]);
    
    // Get ordered steps for tracking (fetch manually to avoid STRING_AGG which pg-mem doesn't support)
    const trackQuery = `
      WITH children AS (
        SELECT rg.target_id AS task_id
        FROM relationship_graph rg
        WHERE rg.relationship_type = 'subtask_of'
          AND rg.type = 'task'
          AND rg.source_id = $1
      )
      SELECT t.id, t.status, t.created_at
      FROM tasks t
      JOIN children c ON c.task_id = t.id
      ORDER BY t.created_at;
    `;
    const trackResult = await this.pool.query<{ id: string; status: string; created_at: Date }>(trackQuery, [parentId]);

    // Build step track manually
    const stepTrack = trackResult.rows
      .map(row => `${row.id}:${row.status}`)
      .join(' -> ');

    if (result.rows.length === 0) {
      return { done: 0, total: 0, pct: 0, stepTrack: '' };
    }

    // Calculate percentage in JavaScript for consistent behavior across DB engines
    const done = result.rows[0].done;
    const total = result.rows[0].total;
    const pct = total === 0 ? 0 : Math.floor((done * 100) / total);

    return {
      done,
      total,
      pct,
      stepTrack,
    };
  }
}
