/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import request from 'supertest';
import orchestratorRoutes from '../../../routes/orchestrator.routes'; // Ensure this path is correct
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import { getDbInstance } from '../../../database/database';
import Database from 'better-sqlite3';
import { OrchestratorService } from '../../../services/orchestrator-services/orchestrator.service';
import { TaskRequest } from '../../../models/service-models/orchestrator.service.model';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/orchestrator', orchestratorRoutes); // Register orchestrator routes
const now = new Date().toISOString();
let orchestratorService: OrchestratorService;

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  // Add test data to the database for the orchestrator service
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertTask(db, '1'); // Add a task to be used in tests
  insertHelpers.insertMemory(db, '3'); // Ensure a memory exists for query tests
});

afterAll(() => {
  testDbHelper.close();
});

describe('Orchestrator Controller Tests', () => {
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

  it('should remember a memory for an assistant', async () => {
    const newMemory = {
      assistantId: '1',
      memory: { type: 'knowledge', data: 'Some memory data' },
      tags: ['tag1', 'tag2'],
    };
    const response = await request(app).post('/orchestrator/remember').send(newMemory);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Memory stored successfully.');
  });

  it('should delegate a task to an assistant', async () => {
    const task = {
      assistantId: '1',
      task: { type: 'task', description: 'Complete the task' },
      tags: ['urgent'],
    };
    const response = await request(app).post('/orchestrator/delegate-task').send(task);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task delegated successfully.');
  });

  it('should connect two assistants', async () => {
    const connectionData = {
      primaryId: '1',
      dependentId: '2',
      relation: 'related_to',
    };
    const response = await request(app).post('/orchestrator/connect-assistants').send(connectionData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Assistants connected successfully.');
  });

  it('should connect two entities', async () => {
    // Ensure that both entities exist in the DB
    const assistantId = 'assistant1'; // Unique assistant ID
    db.prepare('INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      assistantId,
      'Test Assistant',
      'desc',
      'assistant',
      'modelX',
      now,
      now
    );

    const taskId = 'task1'; // Unique task ID
    db.prepare('INSERT INTO tasks (id, description, assignedAssistant, status, inputData, outputData, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      taskId,
      'Test Task',
      assistantId,
      'pending',
      '{}',
      '{}',
      now,
      now
    );

    const connectionData = {
      sourceType: 'assistant',
      sourceId: assistantId,
      targetType: 'task',
      targetId: taskId,
      relation: 'depends_on',
    };

    const response = await request(app).post('/orchestrator/connect-entities').send(connectionData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Entities connected successfully.');
  });

  it('should query knowledge successfully', async () => {
    const query = { query: 'memory data', assistantId: '1' };
    const response = await request(app).get('/orchestrator/query-knowledge').query(query);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Knowledge fetched successfully.');
  });

  it('should suggest assistants for a task', async () => {
    const assistantId = 'assistant2';
    const taskReq: TaskRequest = { type: 'test', description: 'Node' };

    // Insert an assistant with matching tag and memory.
    db.prepare(
      `INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
     VALUES ('${assistantId}', 'Assistant One', 'Expert in Node.js', 'assistant', 'model1', ?, ?)`
    ).run(now, now);

    // Pre-insert a tag for the assistant.
    db.prepare(`INSERT INTO tags (id, name) VALUES ('tag1', 'Node')`).run();
    db.prepare(`INSERT INTO assistant_tags (assistant_id, tag_id) VALUES ('${assistantId}', 'tag1')`).run();

    insertHelpers.insertMemoryFocusRule(db, assistantId);
    // Insert a memory that matches the query.
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
     VALUES ('mem1', 'knowledge', 'Memory about Node.js', 'Some data', ?, ?)`
    ).run(now, now);

    // Link the memory to the assistant
    db.prepare(`INSERT INTO owned_memories (assistant_id, memory_id) VALUES ('${assistantId}', 'mem1')`).run();
    db.prepare(`INSERT INTO focused_memories (memory_focus_id, memory_id) VALUES ('${assistantId}', 'mem1')`).run();

    const response = await request(app).post('/orchestrator/suggest-assistants').send({ task: taskReq });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Assistant suggestions fetched successfully.');
  });

  it('should evaluate an assistant’s performance', async () => {
    const response = await request(app).get('/orchestrator/evaluate-performance/1'); // Assuming assistant ID '1'
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Performance evaluated successfully.');
  });
});
