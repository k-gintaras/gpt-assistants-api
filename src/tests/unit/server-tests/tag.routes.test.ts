import request from 'supertest';
import express from 'express';
import tagRoutes from '../../../routes/tag.routes';
import { Pool } from 'pg';
import { getDb } from '../../../database/database';
import { insertHelpers } from '../test-db-insert.helper';

let db: Pool;
const app = express();
app.use(express.json());
app.use('/tags', tagRoutes); // Register tag routes

const uniqueIdPrefix = 'tagTestRoutes_'; // Unique identifier prefix for testing

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

describe('TagController Tests', () => {
  it('should create a new tag', async () => {
    const tagData = { name: 'New Tag' };

    const response = await request(app).post('/tags').send(tagData);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Tag created successfully.');
    expect(response.body.data).toHaveProperty('tagId'); // Expect the response to have a tagId property
  });

  it('should return 500 when trying to create a tag without a name', async () => {
    const tagData = {}; // Missing name

    const response = await request(app).post('/tags').send(tagData);
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to create tag.');
  });

  it('should remove a tag', async () => {
    const tagId = uniqueIdPrefix + '2'; // Valid tag ID
    await insertHelpers.insertTag(db, tagId, tagId);

    const response = await request(app).delete(`/tags/${tagId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tag removed successfully.');
  });

  it('should return 404 when trying to remove a non-existent tag', async () => {
    const tagId = uniqueIdPrefix + '999'; // Non-existent tag ID

    const response = await request(app).delete(`/tags/${tagId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Tag to delete not found.');
  });

  it('should update a tag', async () => {
    const updatedTag = { name: 'Updated Tag' };

    const tagId = uniqueIdPrefix + '3'; // Valid tag ID
    await insertHelpers.insertTag(db, tagId, tagId);

    const response = await request(app).put(`/tags/${tagId}`).send(updatedTag);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tag updated successfully.');
  });

  it('should return 404 when trying to update a non-existent tag', async () => {
    const tagId = uniqueIdPrefix + '999'; // Non-existent tag ID
    const updatedTag = { name: 'Updated Tag' };

    const response = await request(app).put(`/tags/${tagId}`).send(updatedTag);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Tag to update not found.');
  });

  it('should fetch a tag by ID', async () => {
    const tagId = uniqueIdPrefix + '3'; // Valid tag ID
    await insertHelpers.insertTag(db, tagId, tagId);

    const response = await request(app).get(`/tags/${tagId}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe(tagId);
  });

  it('should return 404 when trying to fetch a non-existent tag', async () => {
    const tagId = uniqueIdPrefix + '999'; // Non-existent tag ID
    const response = await request(app).get(`/tags/${tagId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`Tag with ID ${uniqueIdPrefix}999 not found.`);
  });

  it('should fetch all tags', async () => {
    const tagId = uniqueIdPrefix + '4'; // Valid tag ID
    await insertHelpers.insertTag(db, tagId, tagId);
    const response = await request(app).get('/tags');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0); // Ensure we have at least one tag
  });
});
