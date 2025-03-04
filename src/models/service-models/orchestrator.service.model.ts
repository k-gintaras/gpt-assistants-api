/* eslint-disable @typescript-eslint/no-explicit-any */

import { RelationshipGraph } from '../relationship.model';

/**
 * -- Data Structures --
 */
export type MemoryRequest = {
  type: string;
  text: string; // Content being stored
};

export interface TaskRequest {
  type: string; // e.g. "component", "css", "test"
  description: string; // Summary or instructions
  [key: string]: any; // Optional extra fields
}

export interface TaskResponse {
  success: boolean;
  output?: any; // e.g. code snippet, response data, etc.
  error?: string; // Error message if failed
}

export interface AssistantEvaluation {
  assistantId: string;
  successRate: number; // ratio of completed tasks vs total
  feedbackAverage: number; // avg feedback rating
  tasksCompleted: number;
  tasksFailed: number;
}

export interface AssistantSuggestion {
  assistantId: string;
  score: number; // higher score => more relevant
}

export type RelationshipType = RelationshipGraph['relationshipType'];

/**
 * -- Orchestrator Interface --
 */
export interface OrchestratorServiceModel {
  /**
   * 1) Store a piece of memory for a given assistant,
   *    optionally tagging the new memory row.
   */
  remember(assistantId: string, memory: MemoryRequest, tags?: string[]): Promise<boolean>;

  /**
   * 2) Delegate a task to an assistant, possibly chaining
   *    with sub-tasks or other assistants. You can
   *    also attach tags to the new task if desired.
   */
  delegateTask(assistantId: string, task: TaskRequest, tags?: string[]): Promise<TaskResponse>;

  /**
   * 3) Connect (or "relate") two **assistants** via relationship graph.
   *    Could also be used for memory <-> memory or
   *    assistant <-> task, etc., if you expand the signature.
   */
  connectAssistants(primaryId: string, dependentId: string, relation: RelationshipType): Promise<boolean>;

  /**
   * 4) (New) Connect **any two entities** together (tasks, memories, assistants).
   *    This generalizes the function so we can build more dynamic connections.
   */
  connectEntities(sourceType: 'assistant' | 'memory' | 'task', sourceId: string, targetType: 'assistant' | 'memory' | 'task', targetId: string, relation: RelationshipType): Promise<boolean>;

  /**
   * 5) Query an assistant's knowledge base (memories, tags, etc.)
   *    based on a textual query. Could incorporate tag filtering if needed.
   */
  queryKnowledge(query: string, assistantId?: string, tags?: string[]): Promise<string | null>;

  /**
   * 7) Suggest one or more assistants suited for a given task.
   *    Incorporate assistant_tags, task_tags, or relationship_graph
   *    logic to rank them.
   */
  suggestAssistants(task: TaskRequest, tags?: string[]): Promise<AssistantSuggestion[]>;

  /**
   * 6) Evaluate an assistant's overall performance using
   *    tasks table, feedback table, etc.
   */
  evaluatePerformance(assistantId: string): Promise<AssistantEvaluation>;
}
