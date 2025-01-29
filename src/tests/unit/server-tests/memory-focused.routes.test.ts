import express from 'express';
import request from 'supertest';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import { getDbInstance } from '../../../database/database';
import Database from 'better-sqlite3';
import focusedMemoryRoutes from '../../../routes/memory-focused.routes';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/focused-memories', focusedMemoryRoutes); // Register focused-memory routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertMemory(db, '3');
  insertHelpers.insertMemories(db);
  insertHelpers.insertMemoryFocusRule(db, '1', '1');
  insertHelpers.insertFocusedMemory(db, '1', '2'); // Insert test data for focused memory
});

afterAll(() => {
  testDbHelper.close();
});

describe('FocusedMemory Controller Tests', () => {
  it('should fetch focused memories by assistantId', async () => {
    const response = await request(app).get('/focused-memories/assistant/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/focused-memories/assistant/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No focused memories found for assistant with ID 999.');
  });

  it('should fetch focused memories by memoryFocusId', async () => {
    const response = await request(app).get('/focused-memories/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 400 for non-existent memoryFocusId', async () => {
    const response = await request(app).get('/focused-memories/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No focused memories found for focus ID 999.');
  });

  it('should add focused memory', async () => {
    const response = await request(app).post('/focused-memories/1/3').send();
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Memory added to focus group successfully.');
  });

  it('should return 400 for adding non-existent memory', async () => {
    const response = await request(app).post('/focused-memories/999/3').send();
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to add memory with ID 3 to focus group with ID 999.');
  });

  it('should remove focused memory', async () => {
    const response = await request(app).delete('/focused-memories/1/2');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory removed from focus group successfully.');
  });

  it('should return 400 for removing non-existent memory', async () => {
    const response = await request(app).delete('/focused-memories/999/2');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to remove memory with ID 2 from focus group with ID 999.');
  });

  it('should update focused memories', async () => {
    const response = await request(app)
      .put('/focused-memories/1')
      .send({ memoryIds: ['1', '2'] });
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
