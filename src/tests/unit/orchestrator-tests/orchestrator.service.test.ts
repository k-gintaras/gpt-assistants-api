/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Database from 'better-sqlite3';
import { MemoryRequest, TaskRequest } from '../../../models/service-models/orchestrator.service.model';
import { OrchestratorService } from '../../../services/orchestrator-services/orchestrator.service';

describe('OrchestratorService Integration Tests', () => {
  let db: Database.Database;
  let orchestratorService: OrchestratorService;
  const now = new Date().toISOString();

  beforeEach(() => {
    db = new Database(':memory:');

    // Create minimal tables for memories, tasks, relationships, tags, feedback, and assistants.
    db.exec(`
      CREATE TABLE memories (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT,
        data TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE owned_memories (
        assistant_id TEXT NOT NULL,
        memory_id TEXT NOT NULL,
        PRIMARY KEY (assistant_id, memory_id)
      );
      CREATE TABLE focused_memories (
        memory_focus_id TEXT NOT NULL,
        memory_id TEXT NOT NULL,
        PRIMARY KEY (memory_focus_id, memory_id)
      );
      CREATE TABLE memory_tags (
        memory_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (memory_id, tag_id)
      );
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        description TEXT,
        assignedAssistant TEXT,
        status TEXT,
        inputData TEXT,
        outputData TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE task_tags (
        task_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        entity TEXT NOT NULL,
        PRIMARY KEY (task_id, tag_id, entity)
      );
      CREATE TABLE relationship_graph (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE feedback (
        id TEXT PRIMARY KEY,
        target_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        rating INTEGER,
        comments TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE assistants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT,
        model TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE assistant_tags (
        assistant_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (assistant_id, tag_id)
      );
    `);

    orchestratorService = new OrchestratorService(db);

    // Override the tagService and tagExtraService in the TaskDelegationService for predictable behavior.
    (orchestratorService.taskDelegationService as any).tagService = {
      ensureTagExists: async (tagName: string): Promise<string> => {
        let tag: any = db.prepare('SELECT * FROM tags WHERE name = ?').get(tagName);
        if (!tag) {
          // Use a simple tag ID based on the tag name.
          tag = { id: tagName + '-id', name: tagName };
          db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)').run(tag.id, tag.name);
        }
        return tag.id;
      },
    };

    (orchestratorService.taskDelegationService as any).tagExtraService = {
      addTagToEntity: async (entityId: string, tagId: string, entity: string): Promise<boolean> => {
        db.prepare('INSERT INTO task_tags (task_id, tag_id, entity) VALUES (?, ?, ?)').run(entityId, tagId, entity);
        return true;
      },
    };
  });

  afterEach(() => {
    db.close();
  });

  test('remember: stores memory, links to assistant, and adds tags', async () => {
    const assistantId = 'assistant1';
    // Pre-insert an assistant.
    db.prepare(
      `INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
       VALUES (?, 'Test Assistant', 'desc', 'assistant', 'modelX', ?, ?)`
    ).run(assistantId, now, now);

    const memoryReq: MemoryRequest = { type: 'knowledge', data: 'Test memory content for knowledge' };
    const tags = ['tag1'];
    const result: any = await orchestratorService.remember(assistantId, memoryReq, tags);
    expect(result).toBe(true);

    // Verify memory insertion.
    const memory: any = db.prepare(`SELECT * FROM memories`).get();
    expect(memory).toBeDefined();
    expect(memory.type).toBe('knowledge');

    // Verify owned memory linking.
    const owned: any = db.prepare(`SELECT * FROM owned_memories WHERE assistant_id = ?`).get(assistantId);
    expect(owned).toBeDefined();
    expect(owned.memory_id).toBe(memory.id);

    // Verify tag creation and mapping.
    const tag: any = db.prepare(`SELECT * FROM tags WHERE name = ?`).get('tag1');
    expect(tag).toBeDefined();
    const mapping = db.prepare(`SELECT * FROM memory_tags WHERE memory_id = ? AND tag_id = ?`).get(memory.id, tag.id);
    expect(mapping).toBeDefined();
  });

  test('delegateTask: creates task without tags', async () => {
    const assistantId = 'assistant1';
    const taskReq: TaskRequest = { type: 'test', description: 'Test task delegation' };

    const response: any = await orchestratorService.delegateTask(assistantId, taskReq);
    expect(response.success).toBe(true);
    expect(response.output.assignedAssistant).toBe(assistantId);
    expect(response.output.status).toBe('pending');

    const task: any = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(response.output.taskId);
    expect(task).toBeDefined();
    expect(task.description).toBe('Test task delegation');

    const tagMappings: any[] = db.prepare(`SELECT * FROM task_tags WHERE task_id = ?`).all(response.output.taskId);
    expect(tagMappings.length).toBe(0);
  });

  test('delegateTask: creates task with tags', async () => {
    const assistantId = 'assistant1';
    const taskReq: TaskRequest = { type: 'test', description: 'Task with tags' };
    const tags = ['urgent'];
    const response: any = await orchestratorService.delegateTask(assistantId, taskReq, tags);
    expect(response.success).toBe(true);

    const task: any = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(response.output.taskId);
    expect(task).toBeDefined();
    expect(task.description).toBe('Task with tags');

    // Verify that the tag exists and the mapping is created.
    const tag: any = db.prepare(`SELECT * FROM tags WHERE name = ?`).get('urgent');
    expect(tag).toBeDefined();
    const mapping = db.prepare(`SELECT * FROM task_tags WHERE task_id = ? AND tag_id = ?`).get(response.output.taskId, tag.id);
    expect(mapping).toBeDefined();
  });

  test('connectAssistants: connects assistants via relationship_graph', async () => {
    const primaryId = 'assistantA';
    const dependentId = 'assistantB';
    const relation = 'depends_on';
    // Pre-insert assistants.
    db.prepare(
      `INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
       VALUES (?, 'A', 'desc', 'assistant', 'mA', ?, ?)`
    ).run(primaryId, now, now);
    db.prepare(
      `INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
       VALUES (?, 'B', 'desc', 'assistant', 'mB', ?, ?)`
    ).run(dependentId, now, now);

    const result: any = await orchestratorService.connectAssistants(primaryId, dependentId, 'depends_on');
    expect(result).toBe(true);

    const relRow: any = db.prepare(`SELECT * FROM relationship_graph WHERE id = ?`).get(primaryId);
    expect(relRow).toBeDefined();
    expect(relRow.target_id).toBe(dependentId);
    expect(relRow.relationship_type).toBe('depends_on');
  });

  test('connectEntities: connects generic entities', async () => {
    const sourceType: 'assistant' | 'memory' | 'task' = 'memory';
    const sourceId = 'memory1';
    const targetType: 'assistant' | 'memory' | 'task' = 'task';
    const targetId = 'task1';
    const relation = 'related_to';

    const result: any = await orchestratorService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
    expect(result).toBe(true);

    const relRow: any = db.prepare(`SELECT * FROM relationship_graph WHERE id = ?`).get(sourceId);
    expect(relRow).toBeDefined();
    expect(relRow.target_id).toBe(targetId);
    expect(relRow.relationship_type).toBe(relation);
    expect(relRow.type).toBe(sourceType);
  });

  test('queryKnowledge: returns direct memory if available', async () => {
    // Insert a memory whose description contains "knowledge".
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('mem1', 'knowledge', 'This is a knowledge memory', 'Data1', ?, ?)`
    ).run(now, now);

    const result: any = await orchestratorService.queryKnowledge('knowledge');
    expect(result).toContain('knowledge');
  });

  test('suggestAssistants: returns suggestions based on task', async () => {
    // Insert an assistant with matching tag and memory.
    db.prepare(
      `INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
       VALUES ('assistant1', 'Assistant One', 'Expert in Node.js', 'assistant', 'model1', ?, ?)`
    ).run(now, now);
    // Pre-insert a tag for the assistant.
    db.prepare(`INSERT INTO tags (id, name) VALUES ('tag1', 'Node')`).run();
    db.prepare(`INSERT INTO assistant_tags (assistant_id, tag_id) VALUES ('assistant1', 'tag1')`).run();

    // Insert a memory that matches the query.
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('mem1', 'knowledge', 'Memory about Node.js', 'Some data', ?, ?)`
    ).run(now, now);
    // Link the memory to the assistant.
    db.prepare(`INSERT INTO owned_memories (assistant_id, memory_id) VALUES ('assistant1', 'mem1')`).run();
    db.prepare(`INSERT INTO focused_memories (memory_focus_id, memory_id) VALUES ('assistant1', 'mem1')`).run();

    const taskReq: TaskRequest = { type: 'test', description: 'Node' };
    const suggestions: any = await orchestratorService.suggestAssistants(taskReq);
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test('evaluatePerformance: returns evaluation metrics', async () => {
    const assistantId = 'assistant1';
    // Insert tasks: one completed, one failed.
    db.prepare(
      `INSERT INTO tasks (id, description, assignedAssistant, status, inputData, outputData, createdAt, updatedAt)
       VALUES ('task1', 'Task one', ?, 'completed', '{}', '{}', ?, ?)`
    ).run(assistantId, now, now);
    db.prepare(
      `INSERT INTO tasks (id, description, assignedAssistant, status, inputData, outputData, createdAt, updatedAt)
       VALUES ('task2', 'Task two', ?, 'failed', '{}', '{}', ?, ?)`
    ).run(assistantId, now, now);
    // Insert feedback: ratings 4 and 5.
    db.prepare(
      `INSERT INTO feedback (id, target_id, target_type, rating, comments, createdAt, updatedAt)
       VALUES ('fb1', ?, 'assistant', 4, 'Good', ?, ?)`
    ).run(assistantId, now, now);
    db.prepare(
      `INSERT INTO feedback (id, target_id, target_type, rating, comments, createdAt, updatedAt)
       VALUES ('fb2', ?, 'assistant', 5, 'Excellent', ?, ?)`
    ).run(assistantId, now, now);

    const evaluation = await orchestratorService.evaluatePerformance(assistantId);
    expect(evaluation.assistantId).toBe(assistantId);
    expect(evaluation.tasksCompleted).toBe(1);
    expect(evaluation.tasksFailed).toBe(1);
    expect(evaluation.successRate).toBeCloseTo(0.5, 2);
    expect(evaluation.feedbackAverage).toBeCloseTo(4.5, 2);
  });
});
