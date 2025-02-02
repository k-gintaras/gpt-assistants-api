import express from 'express';
import request from 'supertest';
import assistantRoutes from '../../../routes/assistant.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import Database from 'better-sqlite3';
import { getDbInstance } from '../../../database/database';

// ### important helpers >>>
let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/assistants', assistantRoutes); // Register the assistant routes

// ### pre setup the database >>>
beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1');
});

afterAll(() => {
  // Clean up and close the database after tests
  testDbHelper.close();
});

describe('Assistant Controller Tests', () => {
  // Test GET /assistants (fetch all assistants)
  it('should fetch all assistants', async () => {
    const response = await request(app).get('/assistants');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true); // Expect an array of assistants
    expect(response.body.data.length).toBeGreaterThan(0); // Expect at least one assistant
  });

  // Test GET /assistants/:id (fetch a specific assistant by ID)
  it('should fetch assistant by ID', async () => {
    const response = await request(app).get('/assistants/1'); // Fetch the assistant with ID '1'
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id', '1'); // Ensure ID matches
  });

  // Test POST /assistants (create a new assistant with type="chat")
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
    const updatedAssistant = {
      name: 'Updated Chat Assistant',
      type: 'chat',
      model: 'gpt-3.5-turbo',
      instructions: 'Updated instructions for chat assistant',
    };

    const response = await request(app).put('/assistants/1').send(updatedAssistant);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Assistant updated successfully.');
  });

  // Test DELETE /assistants/:id (delete an assistant)
  // ! we don't delete at the moment, just "inactive_" deactivate... for later improvement
  //   it('should delete an assistant', async () => {
  //     const response = await request(app).delete('/assistants/1');
  //     expect(response.status).toBe(200);
  //     expect(response.body.message).toBe('Assistant deleted successfully.');
  //   });
});
