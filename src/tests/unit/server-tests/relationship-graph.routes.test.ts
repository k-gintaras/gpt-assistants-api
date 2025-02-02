import express from 'express';
import request from 'supertest';
import relationshipGraphRoutes from '../../../routes/relationship-graph.routes'; // Make sure the path to your routes is correct
import { testDbHelper } from '../test-db.helper'; // Assuming you have a helper to initialize the database
import Database from 'better-sqlite3';
import { getDbInstance } from '../../../database/database';
import { insertHelpers } from '../test-db-insert.helper';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/relationships', relationshipGraphRoutes); // Register prompt routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1'); // Insert test data for assistant
  insertHelpers.insertMemories(db);
  // id, targetId
  insertHelpers.insertRelationship(db, '1', '1');
});

afterAll(() => {
  testDbHelper.close();
});

afterAll(() => {
  testDbHelper.close(); // Clean up the database after all tests
});

describe('Relationship Graph Controller Tests', () => {
  it('should fetch all relationships', async () => {
    const response = await request(app).get('/relationships');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should fetch relationships by source (targetId)', async () => {
    const response = await request(app).get('/relationships/source/1'); // Assuming targetId '1' exists
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should fetch relationships by source ID and type', async () => {
    const response = await request(app).get('/relationships/source/1/assistant'); // Assuming targetId '1' and type 'related_to' exist
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
    const newRelationship = {
      id: '2',
      targetId: '2',
      relationshipType: 'related_to',
      type: 'assistant',
    };
    const response = await request(app).post('/relationships').send(newRelationship);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Relationship created successfully.');
  });

  it('should update an existing relationship', async () => {
    const updatedData = {
      relationshipType: 'related_to',
    };
    const response = await request(app).put('/relationships/1').send(updatedData); // Assuming relationship ID '1' exists
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
    const response = await request(app).delete('/relationships/1'); // Assuming relationship ID '1' exists
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Relationship deleted successfully.');
  });

  it('should return 404 for deleting a non-existent relationship', async () => {
    const response = await request(app).delete('/relationships/999'); // Non-existent relationship ID
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Relationship with ID 999 not found or delete failed.');
  });
});
