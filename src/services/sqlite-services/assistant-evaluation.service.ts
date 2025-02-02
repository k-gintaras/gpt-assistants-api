import Database from 'better-sqlite3';
import { AssistantEvaluation } from '../../models/service-models/orchestrator.service.model';

export class AssistantEvaluationService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }
  async evaluatePerformance(assistantId: string): Promise<AssistantEvaluation> {
    // Query task performance: counts of completed, failed, and total tasks
    const tasksRow = this.db
      .prepare(
        `
    SELECT 
      COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS tasksCompleted,
      COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) AS tasksFailed,
      COUNT(*) AS totalTasks
    FROM tasks
    WHERE assignedAssistant = ?
  `
      )
      .get(assistantId) as { tasksCompleted: number; tasksFailed: number; totalTasks: number };

    const { tasksCompleted, tasksFailed, totalTasks } = tasksRow;
    const successRate = totalTasks > 0 ? tasksCompleted / totalTasks : 0;

    // Query average feedback for the assistant
    const feedbackRow = this.db
      .prepare(
        `
    SELECT COALESCE(AVG(rating), 0) AS avgFeedback
    FROM feedback
    WHERE target_id = ? AND target_type = 'assistant'
  `
      )
      .get(assistantId) as { avgFeedback: number };

    return {
      assistantId,
      successRate,
      feedbackAverage: feedbackRow.avgFeedback,
      tasksCompleted,
      tasksFailed,
    };
  }
}
