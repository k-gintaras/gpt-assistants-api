import express from 'express';
import request from 'supertest';
import orchestratorRoutes from '../../../routes/orchestrator.routes'; // Ensure this path is correct
import { insertHelpers } from '../test-db-insert.helper';
import { TaskRequest } from '../../../models/service-models/orchestrator.service.model';
import { getDb } from '../../../database/database';
import { Pool } from 'pg';

const app = express();
let db: Pool;

app.use(express.json());
app.use('/orchestrator', orchestratorRoutes); // Register orchestrator routes

const uniqueIdPrefix = 'orchestratorRoutesTest_'; // Unique identifier prefix for testing

beforeAll(async () => {
  await getDb().initialize();
  db = getDb().getInstance();
});

beforeEach(async () => {
  await db.query('BEGIN'); // Begin transaction before each test
});

afterEach(async () => {
  await db.query('ROLLBACK'); // Rollback changes after each test
});

afterAll(async () => {
  await getDb().close(); // Clean up the test database after tests
});

describe('Orchestrator Controller Tests', () => {
  it('should remember a memory for an assistant', async () => {
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 1);
    const newMemory = {
      assistantId: uniqueIdPrefix + '1',
      memory: { type: 'knowledge', data: 'Some memory data' },
      tags: ['tag1', 'tag2'],
    };
    const response = await request(app).post('/orchestrator/remember').send(newMemory);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Memory stored successfully.');
  });

  it('should delegate a task to an assistant', async () => {
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 2);

    const task = {
      assistantId: uniqueIdPrefix + '2',
      task: { type: 'task', description: 'Complete the task' },
      tags: ['urgent'],
    };
    const response = await request(app).post('/orchestrator/delegate-task').send(task);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task delegated successfully.');
  });

  it('should connect two assistants', async () => {
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 4);
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 5);

    const connectionData = {
      primaryId: uniqueIdPrefix + '4',
      dependentId: uniqueIdPrefix + '5', // Make sure this ID exists in your setup
      relation: 'related_to',
    };
    const response = await request(app).post('/orchestrator/connect-assistants').send(connectionData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Assistants connected successfully.');
  });

  it('should connect two entities', async () => {
    const assistantId = uniqueIdPrefix + 'assistant6'; // Unique assistant ID
    const taskId = uniqueIdPrefix + 'task';
    await insertHelpers.insertAssistant(db, assistantId);
    await insertHelpers.insertTask(db, taskId, 'qq', assistantId, 'pending');

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
    const assistantId = uniqueIdPrefix + 'assistant7'; // Unique assistant ID

    await insertHelpers.insertAssistant(db, assistantId);
    await insertHelpers.insertMemory(db, uniqueIdPrefix + 'm1', 'amazing memory data');
    await insertHelpers.insertOwnedMemory(db, assistantId, uniqueIdPrefix + 'm1');

    const query = { query: 'memory data', assistantId: uniqueIdPrefix + '1' };
    const response = await request(app).get('/orchestrator/query-knowledge').query(query);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Knowledge fetched successfully.');
  });

  it('should suggest assistants for a task', async () => {
    const assistantId = uniqueIdPrefix + 'assistant8';
    const taskReq: TaskRequest = { type: 'test', description: 'Node' };

    await insertHelpers.insertAssistant(db, assistantId);
    await insertHelpers.insertMemory(db, uniqueIdPrefix + 'm1', 'Memory about Node.js');
    await insertHelpers.insertMemory(db, uniqueIdPrefix + 'm2', 'Another Memory about Node2.js');
    await insertHelpers.insertTag(db, uniqueIdPrefix + 't1', 'Node');
    await db.query(`INSERT INTO assistant_tags (assistant_id, tag_id) VALUES ('${assistantId}', '${uniqueIdPrefix + 't1'}')`);

    await insertHelpers.insertMemoryFocusRule(db, uniqueIdPrefix + 'r1', assistantId);

    await insertHelpers.insertOwnedMemory(db, assistantId, uniqueIdPrefix + 'm1');

    await insertHelpers.insertFocusedMemory(db, uniqueIdPrefix + 'r1', uniqueIdPrefix + 'm2');

    const response = await request(app).post('/orchestrator/suggest-assistants').send({ task: taskReq });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Assistant suggestions fetched successfully.');
  });

  it('should evaluate an assistant’s performance', async () => {
    const assistantId = uniqueIdPrefix + 'assistant9'; // Unique assistant ID

    await insertHelpers.insertAssistant(db, assistantId);
    const response = await request(app).get(`/orchestrator/evaluate-performance/${assistantId}`); // Assuming assistant ID is uniqueIdPrefix + '1'
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Performance evaluated successfully.');
  });
});
