import express from 'express';
import request from 'supertest';
import ownedMemoryRoutes from '../../../routes/memory-owned.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import { getDbInstance } from '../../../database/database';
import Database from 'better-sqlite3';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/owned-memories', ownedMemoryRoutes); // Register owned-memory routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertMemories(db);
  insertHelpers.insertMemory(db, '3');
  insertHelpers.insertMemoryFocusRule(db, '1');
  insertHelpers.insertOwnedMemory(db, '1', '1'); // Insert test data for owned memory
  insertHelpers.insertOwnedMemory(db, '1', '2'); // Insert test data for owned memory
});

afterAll(() => {
  testDbHelper.close();
});

describe('OwnedMemory Controller Tests', () => {
  it('should fetch memories by assistantId', async () => {
    const response = await request(app).get('/owned-memories/assistant/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/owned-memories/assistant/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No memories found for assistant with ID 999.');
  });

  it('should fetch owned memories by assistantId', async () => {
    const response = await request(app).get('/owned-memories/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/owned-memories/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No owned memories found for assistant with ID 999.');
  });

  it('should add owned memory', async () => {
    const response = await request(app).post('/owned-memories/1/3').send();
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Memory added to assistant successfully.');
  });

  it('should return 404 for adding non-existent memory', async () => {
    const response = await request(app).post('/owned-memories/999/3').send();
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to add memory with ID 3 to assistant with ID 999.');
  });

  it('should remove owned memory', async () => {
    const response = await request(app).delete('/owned-memories/1/2');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory removed from assistant successfully.');
  });

  it('should return 400 for removing non-existent memory', async () => {
    const response = await request(app).delete('/owned-memories/999/2');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to remove memory with ID 2 from assistant with ID 999.');
  });

  it('should update owned memories', async () => {
    const response = await request(app)
      .put('/owned-memories/1')
      .send({ memoryIds: ['1', '2'] });
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
