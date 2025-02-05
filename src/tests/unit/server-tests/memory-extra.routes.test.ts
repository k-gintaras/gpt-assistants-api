import express from 'express';
import request from 'supertest';
import memoryExtraRoutes from '../../../routes/memory-extra.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import { getDb } from '../../../database/database';

const mId = 'memoryExtraRouteTestId'; // Unique identifier prefix for the test
let db: Pool;
const app = express();
app.use(express.json());
app.use('/memory-extra', memoryExtraRoutes); // Register memory-extra routes

// ### pre setup the database >>>
beforeAll(async () => {
  await getDb().initialize();
  db = getDb().getInstance();
  await insertHelpers.insertAssistant(db, id('assistant')); // Ensure assistant exists
  await insertHelpers.insertMemory(db, id('m1'), id('m1')); // Insert sample memories for testing
  await insertHelpers.insertMemory(db, id('m2'), id('m2')); // Insert sample memories for testing
  await insertHelpers.insertMemory(db, id('m3'), id('m3')); // Insert sample memories for testing
  await insertHelpers.insertMemoryFocusRule(db, id('rule'), id('assistant')); // Insert necessary data
  await insertHelpers.insertTag(db, id('t1'), id('t1')); // Insert tags and other required data
  await insertHelpers.insertTag(db, id('t2'), id('t2')); // Insert tags and other required data
  await insertHelpers.insertTagMemory(db, id('m1'), id('t1'));
  await insertHelpers.insertTagMemory(db, id('m1'), id('t2'));
});

beforeEach(async () => {
  await db.query('BEGIN'); // Begin transaction before each test
});

afterEach(async () => {
  await db.query('ROLLBACK'); // Rollback changes after each test
});

function id(s: string) {
  return mId + s;
}

afterAll(async () => {
  await getDb().close(); // Close the test database
});

describe('MemoryExtra Controller Tests', () => {
  it('should fetch all memories with tags', async () => {
    const response = await request(app).get('/memory-extra');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should fetch memories by tags', async () => {
    const response = await request(app).get(`/memory-extra/tags?tags=${mId}t1,${mId}t2`);
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
    const updatedTags = [`${mId}t1`, `${mId}t2`, `${mId}t3`];
    const response = await request(app).put(`/memory-extra/tags/${mId}m1`).send({ newTags: updatedTags });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory tags updated successfully.');
  });

  it('should return 404 for non-existent memory when updating tags', async () => {
    const updatedTags = [`${mId}tag1`, `${mId}tag2`];
    const response = await request(app).put(`/memory-extra/tags/${mId}999`).send({ newTags: updatedTags });

    expect(response.status).toBe(404); // memory not found
    expect(response.body.message).toBe(`Memory with ID ${mId}999 not found or update failed.`);
  });
});
