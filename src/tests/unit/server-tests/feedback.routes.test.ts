import express from 'express';
import request from 'supertest';
import feedbackRoutes from '../../../routes/feedback.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import { getDb } from '../../../database/database';

const fId = 'feedbackIdfeedbackRoutes';
let db: Pool;
const app = express();
app.use(express.json());
app.use('/feedback', feedbackRoutes); // Register feedback routes

// ### pre setup the database >>>
beforeAll(async () => {
  await getDb().initialize();
  db = getDb().getInstance();
  await insertHelpers.insertAssistant(db, fId + '1'); // ensure assistant exists
  await insertHelpers.insertFeedback(db, fId + '1', fId + '1'); // Inserting test data
});

beforeEach(async () => {
  await db.query('BEGIN'); // Begin transaction before each test
});

afterEach(async () => {
  await db.query('ROLLBACK'); // Rollback changes after each test
});

afterAll(async () => {
  // Clean up and close the database after tests
  await getDb().close();
});

describe('Feedback Controller Tests', () => {
  it('should fetch feedback by ID', async () => {
    const response = await request(app).get(`/feedback/${fId + '1'}`); // Assuming feedback ID '1' exists
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe(fId + '1');
  });

  it('should return 404 for non-existent feedback ID', async () => {
    const response = await request(app).get('/feedback/999'); // Non-existent feedback ID
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Feedback with ID 999 not found.');
  });

  it('should fetch feedback by target (assistant)', async () => {
    const response = await request(app).get(`/feedback/target/${fId + '1'}/assistant`); // Assuming target '1' exists for 'assistant'
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return 404 for feedback by non-existent target', async () => {
    const response = await request(app).get('/feedback/target/999/assistant'); // Non-existent target ID
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'No feedback found for assistant with ID 999.');
  });

  it('should create new feedback', async () => {
    const newFeedback = {
      targetId: fId + '1',
      targetType: 'assistant',
      rating: 2,
      comments: 'Great assistant!', // Adjusted to match the structure
    };
    const response = await request(app).post('/feedback').send(newFeedback);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Feedback added successfully.');
    expect(response.body.data).toHaveProperty('id');
  });

  it('should update feedback', async () => {
    const updatedFeedback = {
      comments: 'Updated feedback content',
    };
    const response = await request(app)
      .put(`/feedback/${fId + '1'}`)
      .send(updatedFeedback); // Assuming feedback ID '1'
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Feedback updated successfully.');
  });

  it('should return 500 for updating non-existent feedback', async () => {
    const updatedFeedback = {
      comments: 'Updated feedback content',
    };
    const response = await request(app).put('/feedback/999').send(updatedFeedback); // Non-existent feedback ID
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Failed to update feedback.');
  });

  it('should delete feedback', async () => {
    const response = await request(app).delete(`/feedback/${fId + '1'}`); // Assuming feedback ID '1'
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Feedback deleted successfully.');
  });

  it('should return 404 for deleting non-existent feedback', async () => {
    const response = await request(app).delete('/feedback/999'); // Non-existent feedback ID
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Feedback with ID 999 not found or delete failed.');
  });
});
