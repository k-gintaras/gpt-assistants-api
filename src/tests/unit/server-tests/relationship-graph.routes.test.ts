import express from 'express';
import request from 'supertest';
import relationshipGraphRoutes from '../../../routes/relationship-graph.routes'; // Ensure the path to your routes is correct
import { getDb } from '../../../database/database';
import { Pool } from 'pg';
import { insertHelpers } from '../test-db-insert.helper';

let db: Pool;
const app = express();
app.use(express.json());
app.use('/relationships', relationshipGraphRoutes); // Register relationship routes

const uniqueIdPrefix = 'relationshipRoutesTest_'; // Unique identifier prefix for testing

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

describe('Relationship Graph Controller Tests', () => {
  it('should fetch all relationships', async () => {
    await insertHelpers.insertMemory(db, uniqueIdPrefix + 1, uniqueIdPrefix + 1);
    await insertHelpers.insertMemory(db, uniqueIdPrefix + 2, uniqueIdPrefix + 2);
    await insertHelpers.insertRelationship(db, uniqueIdPrefix + 1, 'memory', uniqueIdPrefix + 2);
    const response = await request(app).get('/relationships');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should fetch relationships by source (targetId)', async () => {
    await insertHelpers.insertMemory(db, uniqueIdPrefix + 4, uniqueIdPrefix + 1);
    await insertHelpers.insertMemory(db, uniqueIdPrefix + 3, uniqueIdPrefix + 3);
    await insertHelpers.insertRelationship(db, uniqueIdPrefix + 3, 'memory', uniqueIdPrefix + 4);

    const response = await request(app).get(`/relationships/source/${uniqueIdPrefix + 3}`); // Assuming targetId exists
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should fetch relationships by source ID and type', async () => {
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 7);
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 8);
    await insertHelpers.insertRelationship(db, uniqueIdPrefix + 7, 'assistant', uniqueIdPrefix + 8);

    const response = await request(app).get(`/relationships/source/${uniqueIdPrefix + 8}/assistant`); // Assuming targetId exists
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true); // Ensure it returns an array
    expect(response.body.data.length).toBeGreaterThan(0); // Expect at least one relationship
  });

  it('should return 404 for relationships by non-existent source ID and type', async () => {
    const response = await request(app).get('/relationships/source/999/related_to'); // Non-existent targetId '999'
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'No relationships found for target ID 999.');
  });

  it('should create a new relationship', async () => {
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 9);
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 10);
    const newRelationship = {
      id: uniqueIdPrefix + 9, // Using a unique ID
      targetId: uniqueIdPrefix + 10, // Using a unique target ID
      relationshipType: 'related_to',
      type: 'assistant',
    };
    const response = await request(app).post('/relationships').send(newRelationship);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Relationship created successfully.');
  });

  it('should update an existing relationship', async () => {
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 9);
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 10);

    await insertHelpers.insertRelationship(db, uniqueIdPrefix + 9, 'assistant', uniqueIdPrefix + 10);

    const updatedData = {
      relationshipType: 'related_to',
    };
    const response = await request(app)
      .put(`/relationships/${uniqueIdPrefix + '9'}`)
      .send(updatedData); // Ensure relationship ID exists
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Relationship updated successfully.');
  });

  it('should return 500 for updating a non-existent relationship', async () => {
    const updatedData = {
      relationshipType: 'colleague',
    };
    const response = await request(app).put('/relationships/999').send(updatedData); // Non-existent relationship ID
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to update relationship.');
  });

  it('should delete a relationship', async () => {
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 11);
    await insertHelpers.insertAssistant(db, uniqueIdPrefix + 12);

    await insertHelpers.insertRelationship(db, uniqueIdPrefix + 11, 'assistant', uniqueIdPrefix + 12);

    const response = await request(app).delete(`/relationships/${uniqueIdPrefix + 11}`); // Ensure relationship ID exists
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Relationship deleted successfully.');
  });

  it('should return 404 for deleting a non-existent relationship', async () => {
    const response = await request(app).delete('/relationships/999'); // Non-existent relationship ID
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Relationship with ID 999 not found or delete failed.');
  });
});
