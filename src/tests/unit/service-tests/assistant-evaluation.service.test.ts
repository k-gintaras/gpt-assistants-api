import Database from 'better-sqlite3';
import { AssistantEvaluationService } from '../../../services/sqlite-services/assistant-evaluation.service';

describe('AssistantEvaluationService', () => {
  let db: Database.Database;
  let service: AssistantEvaluationService;

  beforeEach(() => {
    // Create an in-memory database instance.
    db = new Database(':memory:');
    // Create the required tables.
    db.exec(`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        description TEXT,
        assignedAssistant TEXT,
        status TEXT,
        inputData TEXT,
        outputData TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
      CREATE TABLE feedback (
        id TEXT PRIMARY KEY,
        target_id TEXT,
        target_type TEXT,
        rating INTEGER,
        comments TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
    service = new AssistantEvaluationService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('evaluatePerformance returns correct metrics', async () => {
    const assistantId = 'assistant-1';
    const now = new Date().toISOString();

    // Insert sample tasks: 2 completed, 1 failed (total 3)
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, description, assignedAssistant, status, inputData, outputData, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTask.run('task-1', 'Task 1', assistantId, 'completed', '', '', now, now);
    insertTask.run('task-2', 'Task 2', assistantId, 'failed', '', '', now, now);
    insertTask.run('task-3', 'Task 3', assistantId, 'completed', '', '', now, now);

    // Insert sample feedback: ratings 4 and 5 (average 4.5)
    const insertFeedback = db.prepare(`
      INSERT INTO feedback (id, target_id, target_type, rating, comments, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertFeedback.run('fb-1', assistantId, 'assistant', 4, 'Good job', now, now);
    insertFeedback.run('fb-2', assistantId, 'assistant', 5, 'Excellent', now, now);

    // Execute evaluation
    const evaluation = await service.evaluatePerformance(assistantId);

    expect(evaluation.assistantId).toBe(assistantId);
    expect(evaluation.tasksCompleted).toBe(2);
    expect(evaluation.tasksFailed).toBe(1);
    expect(evaluation.successRate).toBeCloseTo(2 / 3, 5);
    expect(evaluation.feedbackAverage).toBeCloseTo(4.5, 5);
  });
});
