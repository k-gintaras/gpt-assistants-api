import { Pool } from 'pg';
import { AssistantEvaluationService } from '../../../services/sqlite-services/assistant-evaluation.service';
import { insertHelpers } from '../test-db-insert.helper';
import { getDb } from '../test-db.helper';

describe('AssistantEvaluationService', () => {
  let db: Pool;
  let service: AssistantEvaluationService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    service = new AssistantEvaluationService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query('BEGIN'); // Start transaction for each test
  });

  afterEach(async () => {
    await db.query('ROLLBACK'); // Rollback changes after each test
  });

  test('evaluatePerformance returns correct metrics', async () => {
    const assistantId = 'assistant-1';
    await insertHelpers.insertAssistant(db, assistantId);

    await insertHelpers.insertTask(db, 'task-1', 'Task 1', assistantId, 'completed');
    await insertHelpers.insertTask(db, 'task-2', 'Task 2', assistantId, 'failed');
    await insertHelpers.insertTask(db, 'task-3', 'Task 3', assistantId, 'completed');

    await insertHelpers.insertFeedback(db, 'fb-1', assistantId);
    await insertHelpers.insertFeedback(db, 'fb-2', assistantId);

    const evaluation = await service.evaluatePerformance(assistantId);

    expect(evaluation.assistantId).toBe(assistantId);
    expect(evaluation.tasksCompleted).toBe(2);
    expect(evaluation.tasksFailed).toBe(1);
    expect(evaluation.successRate).toBeCloseTo(2 / 3, 5);
    expect(evaluation.feedbackAverage).toBeCloseTo(5, 5);
  });
});
