/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import { MemoryRequest, TaskRequest } from '../../../models/service-models/orchestrator.service.model';
import { OrchestratorService } from '../../../services/orchestrator-services/orchestrator.service';
import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';

const oId = 'orchestratorServiceId';
describe('OrchestratorService Integration Tests', () => {
  let db: Pool;
  let orchestratorService: OrchestratorService;
  const now = new Date().toISOString();

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query(`BEGIN`);
    orchestratorService = new OrchestratorService(db);
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  test('remember: stores memory, links to assistant, and adds tags', async () => {
    const assistantId = oId + 'assistant1';
    const now = new Date().toISOString();

    // Insert assistant into the database
    await db.query(
      `INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
     VALUES ($1, 'Test Assistant', 'desc', 'assistant', 'modelX', $2, $3)`,
      [assistantId, now, now]
    );

    const memoryReq: MemoryRequest = { type: 'knowledge', text: 'Test memory content for knowledge' };
    const tags = ['tag1'];

    // Call the remember method to store the memory and associate it with the assistant
    const result: any = await orchestratorService.remember(assistantId, memoryReq, tags);
    expect(result).toBe(true);

    // Ensure memory is stored in the memories table
    const memories: any = await db.query(`SELECT * FROM memories`).then((res) => res.rows);
    const mm = memories.find((m: any) => m.description === memoryReq.text);
    expect(mm).toBeDefined();
    expect(mm.type).toBe('knowledge');
    expect(mm.description).toBe(memoryReq.text);

    // Ensure that the memory is linked to the assistant
    const owned: any = await db.query(`SELECT * FROM owned_memories WHERE assistant_id = $1`, [assistantId]).then((res) => res.rows[0]);
    expect(owned).toBeDefined();
    expect(owned.memory_id).toBe(mm.id); // Verify the memory is linked

    // Check if the memory is correctly stored again through the owned_memories link
    const m: any = await db.query(`SELECT * FROM memories WHERE id = $1`, [owned.memory_id]).then((res) => res.rows[0]);
    expect(m).toBeDefined();
    expect(m.id).toBe(mm.id); // Ensure we have the correct memory record

    // Ensure that the tag is inserted and associated with the memory
    const tag: any = await db.query(`SELECT * FROM tags WHERE name = $1`, ['tag1']).then((res) => res.rows[0]);
    expect(tag).toBeDefined();

    const mapping: any = await db.query(`SELECT * FROM memory_tags WHERE memory_id = $1 AND tag_id = $2`, [mm.id, tag.id]).then((res) => res.rows[0]);
    expect(mapping).toBeDefined();

    // Verify the tag is properly associated with the memory
    expect(mapping.memory_id).toBe(mm.id);
    expect(mapping.tag_id).toBe(tag.id);

    // Clean up: Ensure that the memory is removed from the tables if no longer needed
    // (Optional, for cleaning up the test data in between tests)
    await db.query('DELETE FROM memory_tags WHERE memory_id = $1', [mm.id]);
    await db.query('DELETE FROM owned_memories WHERE memory_id = $1', [mm.id]);
    await db.query('DELETE FROM memories WHERE id = $1', [mm.id]);
  });

  test('delegateTask: creates task without tags', async () => {
    const assistantId = oId + 'assistant2';
    await db.query(
      `INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
       VALUES ($1, 'Test Assistant', 'desc', 'assistant', 'modelX', $2, $3)`,
      [assistantId, now, now]
    );
    const taskReq: TaskRequest = { type: 'test', description: 'Test task delegation' };

    const response: any = await orchestratorService.delegateTask(assistantId, taskReq);
    expect(response.success).toBe(true);
    expect(response.output.assignedAssistant).toBe(assistantId);
    expect(response.output.status).toBe('pending');

    const task: any = await db.query(`SELECT * FROM tasks WHERE id = $1`, [response.output.taskId]).then((res) => res.rows[0]);
    expect(task).toBeDefined();
    expect(task.description).toBe('Test task delegation');

    const tagMappings: any[] = await db.query(`SELECT * FROM task_tags WHERE task_id = $1`, [response.output.taskId]).then((res) => res.rows);
    expect(tagMappings.length).toBe(0);
  });

  test('delegateTask: creates task with tags', async () => {
    const assistantId = oId + 'assistant1';
    await db.query(
      `INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
       VALUES ($1, 'Test Assistant', 'desc', 'assistant', 'modelX', $2, $3)`,
      [assistantId, now, now]
    );
    const taskReq: TaskRequest = { type: 'test', description: 'Task with tags' };
    const tags = ['urgent'];
    const response: any = await orchestratorService.delegateTask(assistantId, taskReq, tags);
    expect(response.success).toBe(true);

    const task: any = await db.query(`SELECT * FROM tasks WHERE id = $1`, [response.output.taskId]).then((res) => res.rows[0]);
    expect(task).toBeDefined();
    expect(task.description).toBe('Task with tags');

    const tag: any = await db.query(`SELECT * FROM tags WHERE name = $1`, ['urgent']).then((res) => res.rows[0]);
    expect(tag).toBeDefined();
    const mapping = await db.query(`SELECT * FROM task_tags WHERE task_id = $1 AND tag_id = $2`, [response.output.taskId, tag.id]).then((res) => res.rows[0]);
    expect(mapping).toBeDefined();
  });

  test('connectAssistants: connects assistants via relationship_graph', async () => {
    const primaryId = oId + 'assistantA';
    const dependentId = oId + 'assistantB';
    const relation = 'depends_on';
    await db.query(
      `INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
       VALUES ($1, 'A', 'desc', 'assistant', 'mA', $2, $3)`,
      [primaryId, now, now]
    );
    await db.query(
      `INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
       VALUES ($1, 'B', 'desc', 'assistant', 'mB', $2, $3)`,
      [dependentId, now, now]
    );

    const result: any = await orchestratorService.connectAssistants(primaryId, dependentId, relation);
    expect(result).toBe(true);

    const relRow: any = await db.query(`SELECT * FROM relationship_graph WHERE id = $1`, [primaryId]).then((res) => res.rows[0]);
    expect(relRow).toBeDefined();
    expect(relRow.target_id).toBe(dependentId);
    expect(relRow.relationship_type).toBe('depends_on');
  });

  test('connectEntities: connects generic entities', async () => {
    const sourceType: 'assistant' | 'memory' | 'task' = 'memory';
    const sourceId = oId + 'memory1';
    const targetType: 'assistant' | 'memory' | 'task' = 'task';
    const targetId = oId + 'task1';
    const relation = 'related_to';

    const result: any = await orchestratorService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
    expect(result).toBe(true);

    const relRow: any = await db.query(`SELECT * FROM relationship_graph WHERE id = $1`, [sourceId]).then((res) => res.rows[0]);
    expect(relRow).toBeDefined();
    expect(relRow.target_id).toBe(targetId);
    expect(relRow.relationship_type).toBe(relation);
    expect(relRow.type).toBe(sourceType);
  });

  test('queryKnowledge: returns direct memory if available', async () => {
    const data = JSON.stringify('Data1');
    await db.query(
      `INSERT INTO memories (id, type, description, data, created_at, updated_at)
       VALUES ($1, 'knowledge', 'This is a knowledge memory', $2, $3, $4)`,
      ['mem1', data, now, now]
    );

    const result: any = await orchestratorService.queryKnowledge('knowledge');
    expect(result).toContain('knowledge');
  });

  test('suggestAssistants: returns suggestions based on task', async () => {
    const aId = oId + 'assistant3';
    await db.query(
      `INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
       VALUES ($1, 'Assistant One', 'Expert in Node.js', 'assistant', 'model1', $2, $3)`,
      [aId, now, now]
    );
    await db.query(`INSERT INTO tags (id, name) VALUES ($1, $2)`, [oId + 'tag1', 'Node']);
    await db.query(`INSERT INTO assistant_tags (assistant_id, tag_id) VALUES ($1, $2)`, [aId, oId + 'tag1']);

    await db.query(
      `INSERT INTO memories (id, type, description, data, created_at, updated_at)
       VALUES ($1, 'knowledge', 'Memory about Node.js', $2, $3, $4)`,
      [oId + 'mem1', JSON.stringify('Some data'), now, now]
    );
    await insertHelpers.insertMemoryFocusRule(db, oId + 'memoryFocusRuleId', aId);
    await db.query(`INSERT INTO owned_memories (assistant_id, memory_id) VALUES ($1, $2)`, [aId, oId + 'mem1']);
    await db.query(`INSERT INTO focused_memories (memory_focus_id, memory_id) VALUES ($1, $2)`, [oId + 'memoryFocusRuleId', oId + 'mem1']);

    const taskReq: TaskRequest = { type: 'test', description: 'Node' };
    const suggestions: any = await orchestratorService.suggestAssistants(taskReq);
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test('evaluatePerformance: returns evaluation metrics', async () => {
    const aId = oId + 'assistant4';
    const data1 = JSON.stringify({});
    const data2 = JSON.stringify({});

    await db.query(
      `INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
       VALUES ($1, 'Assistant One', 'Expert in Node.js', 'assistant', 'model1', $2, $3)`,
      [aId, now, now]
    );

    await db.query(
      `INSERT INTO tasks (id, description, assigned_assistant, status, input_data, output_data, created_at, updated_at)
       VALUES ($1, $2, $3, 'completed', $4, $5, $6, $7)`,
      [oId + 'task1', 'Task one', aId, data1, data1, now, now]
    );
    await db.query(
      `INSERT INTO tasks (id, description, assigned_assistant, status, input_data, output_data, created_at, updated_at)
       VALUES ($1, $2, $3, 'failed', $4, $5, $6, $7)`,
      [oId + 'task2', 'Task two', aId, data1, data2, now, now]
    );

    await db.query(
      `INSERT INTO feedback (id, target_id, target_type, rating, comments, created_at, updated_at)
       VALUES ($1, $2, 'assistant', 4, 'Good', $3, $4)`,
      [oId + 'fb1', aId, now, now]
    );
    await db.query(
      `INSERT INTO feedback (id, target_id, target_type, rating, comments, created_at, updated_at)
       VALUES ($1, $2, 'assistant', 5, 'Excellent', $3, $4)`,
      [oId + 'fb2', aId, now, now]
    );

    const evaluation = await orchestratorService.evaluatePerformance(aId);
    expect(evaluation.assistantId).toBe(aId);
    expect(evaluation.tasksCompleted).toBe(1);
    expect(evaluation.tasksFailed).toBe(1);
    expect(evaluation.successRate).toBeCloseTo(0.5, 2);
    expect(evaluation.feedbackAverage).toBeCloseTo(4.5, 2);
  });
});
