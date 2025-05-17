import express from 'express';
import request from 'supertest';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import focusedMemoryRoutes from '../../../routes/memory-focused.routes';
import { getDb } from '../../../database/database';

let db: Pool;
const app = express();
app.use(express.json());
app.use('/focused-memories', focusedMemoryRoutes); // Register focused-memory routes

const uniqueIdPrefix = 'focusedMemoryRouteTest_'; // Unique identifier prefix for testing

beforeAll(async () => {
  await getDb().initialize();
  db = getDb().getInstance();
  // Insert test data using unique IDs
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

describe('FocusedMemory Controller Tests', () => {
  it('should fetch focused memories by assistantId', async () => {
    const assistantId = uniqueIdPrefix + 'assistant2';
    const ruleId = uniqueIdPrefix + '2';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '1', 'm1'); // Unique memory ID
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '2', 'm2'); // Unique memory ID
    await insertHelpers.insertMemoryFocusRule(db, ruleId, assistantId); // Unique memory focus rule
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '1'); // Test focused memory
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '2'); // Test focused memory

    const response = await request(app).get(`/focused-memories/assistant/${assistantId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/focused-memories/assistant/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No focused memories found for assistant with ID 999.');
  });

  it('should fetch focused memories by memoryFocusId', async () => {
    const assistantId = uniqueIdPrefix + 'assistant2';
    const ruleId = uniqueIdPrefix + '2';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '1', 'm1'); // Unique memory ID
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '2', 'm2'); // Unique memory ID
    await insertHelpers.insertMemoryFocusRule(db, ruleId, assistantId); // Unique memory focus rule
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '1'); // Test focused memory
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '2'); // Test focused memory

    const response = await request(app).get(`/focused-memories/${uniqueIdPrefix + '2'}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for non-existent memoryFocusId', async () => {
    const response = await request(app).get('/focused-memories/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No focused memories found for focus ID 999.');
  });

  it('should add focused memory', async () => {
    const assistantId = uniqueIdPrefix + 'assistant3';
    const ruleId = uniqueIdPrefix + '3';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '4', 'm1'); // Unique memory ID
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '5', 'm2'); // Unique memory ID
    await insertHelpers.insertMemoryFocusRule(db, ruleId, assistantId); // Unique memory focus rule

    const response = await request(app)
      .post(`/focused-memories/${ruleId}/${uniqueIdPrefix + '4'}`)
      .send();
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Memory added to focus group successfully.');
  });

  it('should return 400 for adding non-existent memory', async () => {
    const response = await request(app).post('/focused-memories/999/3').send();
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to add memory with ID 3 to focus group with ID 999.');
  });

  it('should remove focused memory', async () => {
    const assistantId = uniqueIdPrefix + 'assistant7';
    const ruleId = uniqueIdPrefix + '7';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '5', 'm1'); // Unique memory ID
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '6', 'm2'); // Unique memory ID
    await insertHelpers.insertMemoryFocusRule(db, ruleId, assistantId); // Unique memory focus rule
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '5'); // Test focused memory
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '6'); // Test focused memory

    const response = await request(app).delete(`/focused-memories/${uniqueIdPrefix + '7'}/${uniqueIdPrefix + '5'}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory removed from focus group successfully.');
  });

  it('should return 400 for removing non-existent memory', async () => {
    const response = await request(app).delete('/focused-memories/999/2');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to remove memory with ID 2 from focus group with ID 999.');
  });

  it('should update focused memories', async () => {
    const assistantId = uniqueIdPrefix + 'assistant3';
    const ruleId = uniqueIdPrefix + '3';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '3', 'm1'); // Unique memory ID
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '4', 'm2'); // Unique memory ID
    await insertHelpers.insertMemoryFocusRule(db, ruleId, assistantId); // Unique memory focus rule
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '3'); // Test focused memory
    await insertHelpers.insertFocusedMemory(db, ruleId, uniqueIdPrefix + '4'); // Test focused memory

    const response = await request(app)
      .put(`/focused-memories/${uniqueIdPrefix + '3'}`)
      .send({ memoryIds: [uniqueIdPrefix + '3', uniqueIdPrefix + '4'] });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Focused memories updated successfully.');
  });

  it('should return 400 for updating non-existent focus group', async () => {
    const response = await request(app)
      .put('/focused-memories/999')
      .send({ memoryIds: ['1', '2'] });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to update focused memories for focus group with ID 999.');
  });
});
