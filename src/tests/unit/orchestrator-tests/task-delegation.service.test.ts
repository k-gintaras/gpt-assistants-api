/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import { TaskRequest } from '../../../models/service-models/orchestrator.service.model';
import { TaskDelegationService } from '../../../services/orchestrator-services/task-delegation.service';
import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';

const tId = 'taskDelegationId';
describe('TaskDelegationService', () => {
  let db: Pool;
  let taskDelegationService: TaskDelegationService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    taskDelegationService = new TaskDelegationService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query(`BEGIN`);
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  test('delegateTask creates a task without tags', async () => {
    const assistantId: string = tId + 'assistant1';
    const task: TaskRequest = { type: 'test', description: 'Test task delegation' };
    await insertHelpers.insertAssistant(db, assistantId);
    const response: any = await taskDelegationService.delegateTask(assistantId, task);
    expect(response.success).toBe(true);
    expect(response.output).toBeDefined();
    expect(response.output.assignedAssistant).toBe(assistantId);
    expect(response.output.status).toBe('pending');

    const taskRow: any = await db.query(`SELECT * FROM tasks WHERE id = $1`, [response.output.taskId]).then((res) => res.rows[0]);
    expect(taskRow).toBeDefined();
    expect(taskRow.assigned_assistant).toBe(assistantId);
    expect(taskRow.description).toBe('Test task delegation');

    const mappings: any[] = await db.query(`SELECT * FROM task_tags WHERE task_id = $1`, [response.output.taskId]).then((res) => res.rows);
    expect(mappings.length).toBe(0);
  });

  test('delegateTask creates a task with tags', async () => {
    const assistantId: string = tId + 'assistant2';
    const task: TaskRequest = { type: 'test', description: 'Task with tags' };
    const tagNames: string[] = ['urgent', 'backend'];
    await insertHelpers.insertAssistant(db, assistantId);

    const response: any = await taskDelegationService.delegateTask(assistantId, task, tagNames);
    expect(response.success).toBe(true);

    const taskRow: any = await db.query(`SELECT * FROM tasks WHERE id = $1`, [response.output.taskId]).then((res) => res.rows[0]);
    expect(taskRow).toBeDefined();
    expect(taskRow.assigned_assistant).toBe(assistantId);
    expect(taskRow.description).toBe('Task with tags');

    for (const tagName of tagNames) {
      const tagRow: any = await db.query(`SELECT * FROM tags WHERE name = $1`, [tagName]).then((res) => res.rows[0]);
      expect(tagRow).toBeDefined();
      const mapping: any = await db.query(`SELECT * FROM task_tags WHERE task_id = $1 AND tag_id = $2`, [response.output.taskId, tagRow.id]).then((res) => res.rows[0]);
      expect(mapping).toBeDefined();
    }
  });
});
