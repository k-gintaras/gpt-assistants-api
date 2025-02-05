import { Pool } from 'pg';
import { AssistantEvaluation } from '../../models/service-models/orchestrator.service.model';

export class AssistantEvaluationService {
  constructor(private pool: Pool) {}

  async evaluatePerformance(assistantId: string): Promise<AssistantEvaluation> {
    const client = await this.pool.connect();
    try {
      // Query task performance: counts of completed, failed, and total tasks
      const tasksResult = await client.query<{
        tasks_completed: string;
        tasks_failed: string;
        total_tasks: string;
      }>(
        `
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS tasks_completed,
          COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) AS tasks_failed,
          COUNT(*) AS total_tasks
        FROM tasks
        WHERE assigned_assistant = $1
        `,
        [assistantId]
      );

      const { tasks_completed, tasks_failed, total_tasks } = tasksResult.rows[0];
      const successRate = Number(total_tasks) > 0 ? Number(tasks_completed) / Number(total_tasks) : 0;

      // Query average feedback for the assistant
      const feedbackResult = await client.query<{ avg_feedback: string }>(
        `
        SELECT COALESCE(AVG(rating), 0) AS avg_feedback
        FROM feedback
        WHERE target_id = $1 AND target_type = 'assistant'
        `,
        [assistantId]
      );

      const avg_feedback = feedbackResult.rows[0]?.avg_feedback ? parseFloat(feedbackResult.rows[0]?.avg_feedback) : 0;

      return {
        assistantId,
        successRate,
        feedbackAverage: avg_feedback,
        tasksCompleted: Number(tasks_completed),
        tasksFailed: Number(tasks_failed),
      };
    } finally {
      client.release();
    }
  }
}
