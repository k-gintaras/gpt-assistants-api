import express from 'express';
import request from 'supertest';
import memoryRoutes from '../../../routes/memory.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import { getDbInstance } from '../../../database/database';
import Database from 'better-sqlite3';
import { Memory } from '../../../models/memory.model';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/memories', memoryRoutes); // Register memory routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  insertHelpers.insertMemory(db, '1'); // Insert test data for memory
});

afterAll(() => {
  testDbHelper.close();
});

describe('Memory Controller Tests', () => {
  it('should fetch all memories', async () => {
    const response = await request(app).get('/memories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for no memories found', async () => {
    const response = await request(app).get('/memories');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0); // Ensure we have at least one memory
  });

  it('should fetch memory by ID', async () => {
    const response = await request(app).get('/memories/1');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe('1');
  });

  it('should return 404 for non-existent memory ID', async () => {
    const response = await request(app).get('/memories/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Memory with ID 999 not found.');
  });

  it('should create memory', async () => {
    const newMemory: Memory = {
      description: 'New memory description',
      id: '',
      type: 'instruction',
      data: null,
      createdAt: null,
      updatedAt: null,
    };
    const response = await request(app).post('/memories').send(newMemory);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Memory created successfully.');
    expect(response.body.data).toHaveProperty('id');
  });

  it('should return 500 for missing required fields in memory creation', async () => {
    const newMemory = {}; // Missing description
    const response = await request(app).post('/memories').send(newMemory);
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to create memory.');
  });

  it('should update memory', async () => {
    const updatedMemory = {
      description: 'Updated memory description',
      id: '1',
    };
    const response = await request(app).put('/memories/1').send(updatedMemory);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory updated successfully.');
  });

  it('should return 400 for updating non-existent memory ID', async () => {
    const updatedMemory = {
      description: 'Updated memory description',
    };
    const response = await request(app).put('/memories/999').send(updatedMemory);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Memory ID mismatch.');
  });

  it('should delete memory', async () => {
    const response = await request(app).delete('/memories/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory deleted successfully.');
  });

  it('should return 404 for deleting non-existent memory ID', async () => {
    const response = await request(app).delete('/memories/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Memory with ID 999 not found or delete failed.');
  });
});
