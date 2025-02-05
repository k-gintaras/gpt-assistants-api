import express from 'express';
import request from 'supertest';
import assistantRoutes from '../../../routes/assistant.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import { getDb } from '../../../database/database';

const aId = 'assistantRoutesId';
// ### important helpers >>>
const app = express();
app.use(express.json());
app.use('/assistants', assistantRoutes); // Register the assistant routes
let db: Pool;

// ### pre setup the database >>>
beforeAll(async () => {
  await getDb().initialize();
  db = getDb().getInstance();
  await insertHelpers.insertAssistant(db, aId + '1'); // Adjusted for PostgreSQL
});

beforeEach(async () => {
  await db.query('BEGIN'); // Begin transaction before each test
});

afterEach(async () => {
  await db.query('ROLLBACK');
});

afterAll(async () => {
  // Clean up and close the database after tests
  await getDb().close(); // Adjusted for PostgreSQL
});

describe('Assistant Controller Tests', () => {
  // // Test GET /assistants (fetch all assistants)
  it('should fetch all assistants', async () => {
    const response = await request(app).get('/assistants');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true); // Expect an array of assistants
    expect(response.body.data.length).toBeGreaterThan(0); // Expect at least one assistant
  });

  // // Test GET /assistants/:id (fetch a specific assistant by ID)
  it('should fetch assistant by ID', async () => {
    const response = await request(app).get(`/assistants/${aId}1`); // Fetch the assistant with ID '1'
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id', aId + '1'); // Ensure ID matches
  });

  // // Test POST /assistants (create a new assistant with type="chat")
  it('should create a new assistant with type="chat"', async () => {
    const newAssistant = {
      name: 'New Chat Assistant',
      type: 'chat', // Only 'chat' type is allowed
      model: 'gpt-3.5-turbo', // Model can be specified
      instructions: 'Chat assistant instructions',
    };

    const response = await request(app).post('/assistants').send(newAssistant);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Assistant created successfully.');

    expect(response.body.data).toHaveProperty('id');
  });

  // Test PUT /assistants/:id (update an assistant)
  it('should update assistant details', async () => {
    const assistantId = aId + '1';
    const ruleId = aId + 'rule 1';
    const m1 = aId + 'm1';
    const m2 = aId + 'm2';
    const m3 = aId + 'm3';
    const updatedAssistant = {
      name: 'Updated Chat Assistant',
      type: 'chat',
      model: 'gpt-3.5-turbo',
      instructions: 'Updated instructions for chat assistant',
    };

    await insertHelpers.insertAssistant(db, assistantId);

    await insertHelpers.insertMemoryFocusRule(db, ruleId, assistantId);
    await insertHelpers.insertMemory(db, m1, 'M' + 1);
    await insertHelpers.insertMemory(db, m2, 'M' + 2);
    await insertHelpers.insertMemory(db, m3, 'M' + 3);

    await insertHelpers.insertTags(db);
    await db.query(`
          INSERT INTO assistant_tags (assistant_id, tag_id) 
          VALUES ('${assistantId}', '1'), ('${assistantId}', '2')
        `); // Link assistant with tags explicitly

    await insertHelpers.insertFocusedMemory(db, ruleId, m1);
    await insertHelpers.insertFocusedMemory(db, ruleId, m2);
    await insertHelpers.insertFocusedMemory(db, ruleId, m3);

    const response = await request(app).put(`/assistants/${assistantId}`).send(updatedAssistant);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Assistant updated successfully.');
  });

  it('should delete an assistant', async () => {
    const assistantId = aId + '2';

    await insertHelpers.insertAssistant(db, assistantId);

    const response = await request(app).delete('/assistants/${assistantId}');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Assistant deleted successfully.`);
  });
});
