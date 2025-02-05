import express from 'express';
import request from 'supertest';
import ownedMemoryRoutes from '../../../routes/memory-owned.routes';
import { Pool } from 'pg'; // Use pg for PostgreSQL
import { getDb } from '../../../database/database';
import { insertHelpers } from '../test-db-insert.helper';

let db: Pool;
const app = express();
app.use(express.json());
app.use('/owned-memories', ownedMemoryRoutes); // Register owned-memory routes

const uniqueIdPrefix = 'ownedMemoryRouteTest_'; // Unique identifier prefix for testing

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

describe('OwnedMemory Controller Tests', () => {
  it('should fetch memories by assistantId', async () => {
    const assistantId = uniqueIdPrefix + 'assistant8';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '8', 'm1'); // Unique memory ID
    await insertHelpers.insertOwnedMemory(db, assistantId, uniqueIdPrefix + '8');

    const response = await request(app).get(`/owned-memories/assistant/${assistantId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/owned-memories/assistant/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No memories found for assistant with ID 999.');
  });

  it('should fetch owned memories by assistantId', async () => {
    const assistantId = uniqueIdPrefix + 'assistant2';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '3', 'm1'); // Unique memory ID
    await insertHelpers.insertOwnedMemory(db, assistantId, uniqueIdPrefix + '3');

    const response = await request(app).get(`/owned-memories/${assistantId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/owned-memories/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No owned memories found for assistant with ID 999.');
  });

  it('should add owned memory', async () => {
    const assistantId = uniqueIdPrefix + 'assistant3';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '4', 'm1'); // Unique memory ID
    // insertHelpers.insertOwnedMemory(db, assistantId, uniqueIdPrefix + '3');

    const response = await request(app)
      .post(`/owned-memories/${assistantId}/${uniqueIdPrefix + '4'}`)
      .send();
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Memory added to assistant successfully.');
  });

  it('should return 404 for adding non-existent memory', async () => {
    const response = await request(app).post('/owned-memories/999/3').send();
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to add memory with ID 3 to assistant with ID 999.');
  });

  it('should remove owned memory', async () => {
    const assistantId = uniqueIdPrefix + 'assistant5';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '5', 'm1'); // Unique memory ID
    await insertHelpers.insertOwnedMemory(db, assistantId, uniqueIdPrefix + '5');

    const response = await request(app).delete(`/owned-memories/${assistantId}/${uniqueIdPrefix + '5'}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory removed from assistant successfully.');
  });

  it('should return 400 for removing non-existent memory', async () => {
    const response = await request(app).delete('/owned-memories/999/2');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to remove memory with ID 2 from assistant with ID 999.');
  });

  it('should update owned memories', async () => {
    const assistantId = uniqueIdPrefix + 'assistant6';
    await insertHelpers.insertAssistant(db, assistantId); // Use unique ID for assistant
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '6', 'm1'); // Unique memory ID
    await insertHelpers.insertMemory(db, uniqueIdPrefix + '7', 'm2'); // Unique memory ID
    await insertHelpers.insertOwnedMemory(db, assistantId, uniqueIdPrefix + '6');

    const response = await request(app)
      .put(`/owned-memories/${assistantId}`)
      .send({ memoryIds: [uniqueIdPrefix + '6', uniqueIdPrefix + '7'] });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Owned memories updated successfully.');
  });

  it('should return 400 for updating non-existent assistantId', async () => {
    const response = await request(app)
      .put('/owned-memories/999')
      .send({ memoryIds: ['1', '2'] });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to update owned memories for assistant with ID 999.');
  });
});
