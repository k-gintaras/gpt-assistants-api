import express from 'express';
import request from 'supertest';
import memoryExtraRoutes from '../../../routes/memory-extra.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import { getDbInstance } from '../../../database/database';
import Database from 'better-sqlite3';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/memory-extra', memoryExtraRoutes); // Register memory-extra routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db); // Initialize the test database
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertMemories(db); // Insert sample memories for testing
  insertHelpers.insertMemoryFocusRule(db, '1', '1'); // Insert necessary data
  insertHelpers.insertTags(db); // Insert tags and other required data
  insertHelpers.insertTagMemory(db, '1', '1');
  insertHelpers.insertTagMemory(db, '1', '2');
});

afterAll(() => {
  testDbHelper.close(); // Close the test database
});

describe('MemoryExtra Controller Tests', () => {
  it('should fetch all memories with tags', async () => {
    const response = await request(app).get('/memory-extra');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should fetch memories by tags', async () => {
    const response = await request(app).get('/memory-extra/tags?tags=Tag1,Tag2');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should return 400 if tags parameter is missing or invalid', async () => {
    const response = await request(app).get('/memory-extra/tags');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Tags query parameter is required and should be a string.');
  });

  it('should update memory tags successfully', async () => {
    const updatedTags = ['Tag1', 'Tag2', 'Tag3'];
    const response = await request(app).put('/memory-extra/tags/1').send({ newTags: updatedTags });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory tags updated successfully.');
  });

  it('should return 500 for non-existent memory when updating tags', async () => {
    const updatedTags = ['Tag1', 'Tag2'];
    const response = await request(app).put('/memory-extra/tags/999').send({ newTags: updatedTags });

    expect(response.status).toBe(404); // memory not found
    expect(response.body.message).toBe('Memory with ID 999 not found or update failed.');
  });
});
