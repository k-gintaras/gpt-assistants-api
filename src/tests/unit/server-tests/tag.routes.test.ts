import { getDbInstance } from '../../../database/database';
import request from 'supertest';
import express from 'express';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import tagRoutes from '../../../routes/tag.routes';
import Database from 'better-sqlite3';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/tags', tagRoutes);

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertTags(db); // Insert some test data for tags
});

afterAll(() => {
  db.close();
});

describe('TagController Tests', () => {
  it('should create a new tag', async () => {
    const tagData = { name: 'New Tag' };

    const response = await request(app).post('/tags').send(tagData);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Tag created successfully.');
    expect(response.body.data).toHaveProperty('tagId');
  });

  it('should return 500 when trying to create a tag without a name', async () => {
    const tagData = {}; // Missing name

    const response = await request(app).post('/tags').send(tagData);
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to create tag.');
  });

  it('should remove a tag', async () => {
    const tagId = '2'; // Valid tag ID

    const response = await request(app).delete(`/tags/${tagId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tag removed successfully.');
  });

  it('should return 404 when trying to remove a non-existent tag', async () => {
    const tagId = '999'; // Non-existent tag ID

    const response = await request(app).delete(`/tags/${tagId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Tag to delete not found.');
  });

  it('should update a tag', async () => {
    const tagId = '1'; // Valid tag ID
    const updatedTag = { name: 'Updated Tag' };

    const response = await request(app).put(`/tags/${tagId}`).send(updatedTag);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tag updated successfully.');
  });

  it('should return 404 when trying to update a non-existent tag', async () => {
    const tagId = '999'; // Non-existent tag ID
    const updatedTag = { name: 'Updated Tag' };

    const response = await request(app).put(`/tags/${tagId}`).send(updatedTag);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Tag to update not found.');
  });

  it('should fetch a tag by ID', async () => {
    const tagId = '1'; // Valid tag ID

    const response = await request(app).get(`/tags/${tagId}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe(tagId);
  });

  it('should return 404 when trying to fetch a non-existent tag', async () => {
    const tagId = '999'; // Non-existent tag ID
    const response = await request(app).get(`/tags/${tagId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Tag with ID 999 not found.');
  });

  it('should fetch all tags', async () => {
    const response = await request(app).get('/tags');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
