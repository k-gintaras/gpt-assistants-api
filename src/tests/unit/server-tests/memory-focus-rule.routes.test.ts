import express from 'express';
import request from 'supertest';
import memoryFocusRuleRoutes from '../../../routes/memory-focus-rule.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import { getDb } from '../../../database/database';

let db: Pool;
const app = express();
app.use(express.json());
app.use('/memory-focus-rules', memoryFocusRuleRoutes); // Register memory-focus-rule routes

// ### pre setup the database >>>
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

describe('MemoryFocusRule Controller Tests', () => {
  it('should create a new memory focus rule', async () => {
    const assistantId = 'assistant' + Math.floor(Math.random() * 1000); // Generate a unique assistant ID
    await insertHelpers.insertAssistant(db, assistantId); // Ensure assistant exists

    const newMemoryFocusRule = {
      assistantId: assistantId, // Use unique assistant ID
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
    const assistantId = 'assistant' + Math.floor(Math.random() * 1000); // Generate a unique assistant ID
    await insertHelpers.insertAssistant(db, assistantId); // Ensure assistant exists
    await insertHelpers.insertMemoryFocusRule(db, 'mfr' + Math.floor(Math.random() * 1000), assistantId); // Insert memory focus rules for testing

    const response = await request(app).get(`/memory-focus-rules/${assistantId}`); // Use unique assistant ID
    expect(response.status).toBe(200);
    expect(response.body.data !== null).toBe(true);
  });

  it('should return 404 for non-existent assistantId', async () => {
    const response = await request(app).get('/memory-focus-rules/999'); // Non-existent assistant ID
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Memory focus rule for assistant with ID 999 not found.');
  });

  it('should update a memory focus rule', async () => {
    const memoryFocusRuleId = 'mfr' + Math.floor(Math.random() * 1000); // Unique rule ID
    const assistantId = 'assistant' + Math.floor(Math.random() * 1000); // Unique assistant ID

    await insertHelpers.insertAssistant(db, assistantId); // Ensure assistant exists
    await insertHelpers.insertMemoryFocusRule(db, memoryFocusRuleId, assistantId); // Insert memory focus rule for testing

    const updatedMemoryFocusRule = {
      maxResults: 10,
      relationshipTypes: ['newType1', 'newType2'],
      priorityTags: ['newTag1', 'newTag2'],
    };
    const response = await request(app)
      .put(`/memory-focus-rules/${memoryFocusRuleId}`) // Use unique ID for memory focus rule
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
    const memoryFocusRuleId = 'mfr' + Math.floor(Math.random() * 1000); // Unique rule ID
    const assistantId = 'assistant' + Math.floor(Math.random() * 1000); // Unique assistant ID

    await insertHelpers.insertAssistant(db, assistantId); // Ensure assistant exists
    await insertHelpers.insertMemoryFocusRule(db, memoryFocusRuleId, assistantId); // Insert memory focus rule for testing

    const response = await request(app).delete(`/memory-focus-rules/${memoryFocusRuleId}`); // Use unique ID for memory focus rule
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Memory focus rule deleted successfully.');
  });

  it('should return 404 for deleting non-existent memory focus rule', async () => {
    const response = await request(app).delete('/memory-focus-rules/999'); // Non-existent memory focus rule ID
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Memory focus rule with ID 999 not found or delete failed.');
  });
});
