import express from 'express';
import request from 'supertest';
import memoryFocusRuleRoutes from '../../../routes/memory-focus-rule.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import { getDbInstance } from '../../../database/database';
import Database from 'better-sqlite3';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/memory-focus-rules', memoryFocusRuleRoutes); // Register memory-focus-rule routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db); // Initialize the test database
  insertHelpers.insertAssistant(db, '1'); // Insert necessary test data
  insertHelpers.insertMemoryFocusRules(db); // Insert memory focus rules for testing
});

afterAll(() => {
  testDbHelper.close(); // Clean up the test database after tests
});

describe('MemoryFocusRule Controller Tests', () => {
  it('should create a new memory focus rule', async () => {
    const newMemoryFocusRule = {
      assistantId: '1',
      maxResults: 5,
      relationshipTypes: ['type1', 'type2'],
      priorityTags: ['tag1', 'tag2'],
    };
    const response = await request(app).post('/memory-focus-rules').send(newMemoryFocusRule);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Memory focus rule created successfully');
    expect(response.body.data).toHaveProperty('id');
  });

  it('should fetch memory focus rules by assistantId', async () => {
    const response = await request(app).get('/memory-focus-rules/1'); // Assuming assistant ID '1' exists
    expect(response.status).toBe(200);
    expect(response.body.data !== null).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/memory-focus-rules/999'); // Non-existent assistant ID
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Memory focus rule for assistant with ID 999 not found.');
  });

  it('should update a memory focus rule', async () => {
    const updatedMemoryFocusRule = {
      maxResults: 10,
      relationshipTypes: ['newType1', 'newType2'],
      priorityTags: ['newTag1', 'newTag2'],
    };
    const response = await request(app)
      .put('/memory-focus-rules/1') // Assuming memory focus rule with ID '1' exists
      .send(updatedMemoryFocusRule);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory focus rule updated successfully.');
  });

  it('should return 404 for updating non-existent memory focus rule', async () => {
    const updatedMemoryFocusRule = {
      maxResults: 10,
      relationshipTypes: ['newType1', 'newType2'],
      priorityTags: ['newTag1', 'newTag2'],
    };
    const response = await request(app)
      .put('/memory-focus-rules/999') // Non-existent memory focus rule ID
      .send(updatedMemoryFocusRule);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Memory focus rule with ID 999 not found or update failed.');
  });

  it('should delete a memory focus rule', async () => {
    const response = await request(app).delete('/memory-focus-rules/1'); // Assuming memory focus rule with ID '1'
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory focus rule deleted successfully.');
  });

  it('should return 404 for deleting non-existent memory focus rule', async () => {
    const response = await request(app).delete('/memory-focus-rules/999'); // Non-existent memory focus rule ID
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Memory focus rule with ID 999 not found or delete failed.');
  });
});
