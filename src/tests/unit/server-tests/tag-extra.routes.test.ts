import { getDbInstance } from '../../../database/database';
import request from 'supertest';
import express from 'express';
import { insertHelpers } from '../test-db-insert.helper'; // Assuming helper is implemented
import { testDbHelper } from '../test-db.helper';
import tagExtraRoutes from '../../../routes/tag-extra.routes';
import Database from 'better-sqlite3';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/tag-extra', tagExtraRoutes); // Register the tag-extra routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db); // Initialize the test DB
  insertHelpers.insertAssistant(db, '1'); // Insert test data for assistant
  insertHelpers.insertMemories(db); // Insert test data for memories
  insertHelpers.insertTags(db); // Insert some test data for tags and relationships
  insertHelpers.insertRelationship(db, '1', '1'); // Insert test relationship
});

afterAll(() => {
  db.close(); // Close the database connection after tests
});

describe('TagExtraController Tests', () => {
  it('should fetch tags by entity', async () => {
    const entityId = '1'; // Replace with valid entity ID
    const entityType = 'assistant'; // Replace with valid entity type (memory, assistant, task)

    const response = await request(app).get(`/tag-extra/${entityType}/${entityId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should add a tag to an entity', async () => {
    const entityId = '1'; // Replace with valid entity ID
    const tagId = '1'; // Replace with valid tag ID
    const entityType = 'memory'; // Replace with valid entity type

    const response = await request(app).post(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Tag added successfully to entity.');
  });

  it('should return 400 when adding a non-existing tag to an entity', async () => {
    const entityId = '1'; // Valid entity ID
    const tagId = '999'; // Non-existing tag ID
    const entityType = 'memory'; // Entity type

    const response = await request(app).post(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(400); // Expecting failure due to non-existent tag
    expect(response.body.message).toBe('Failed to add tag to entity.');
  });

  it('should remove a tag from an entity', async () => {
    const entityId = '1'; // Valid entity ID
    const tagId = '1'; // Valid tag ID
    const entityType = 'memory'; // Entity type

    const response = await request(app).delete(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tag removed successfully from entity.');
  });

  it('should return 400 when trying to remove a non-existent tag from an entity', async () => {
    const entityId = '1'; // Valid entity ID
    const tagId = '999'; // Non-existent tag ID
    const entityType = 'memory'; // Entity type

    const response = await request(app).delete(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(400); // Expecting failure due to non-existent tag
    expect(response.body.message).toBe('Failed to remove tag from entity.');
  });
});
