import request from 'supertest';
import express from 'express';
import tagExtraRoutes from '../../../routes/tag-extra.routes';
import { Pool } from 'pg';
import { getDb } from '../../../database/database';
import { insertHelpers } from '../test-db-insert.helper';

let db: Pool;
const app = express();
app.use(express.json());
app.use('/tag-extra', tagExtraRoutes); // Register the tag-extra routes

const uniqueIdPrefix = 'tagExtraRoutesTest_'; // Unique identifier prefix for testing

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

describe('TagExtraController Tests', () => {
  it('should fetch tags by entity', async () => {
    const entityId = uniqueIdPrefix + 'm1'; // Valid entity ID
    const tagId = uniqueIdPrefix + 't1'; // Valid entity ID
    const entityType = 'memory'; // Valid entity type (memory, assistant, task)

    await insertHelpers.insertMemory(db, entityId, 'm1');
    await insertHelpers.insertTag(db, tagId, 'qq');
    await insertHelpers.insertTagMemory(db, entityId, tagId);

    const response = await request(app).get(`/tag-extra/${entityType}/${entityId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should add a tag to an entity', async () => {
    const entityId = uniqueIdPrefix + '2'; // Valid entity ID
    const tagId = uniqueIdPrefix + '2'; // Valid tag ID
    const entityType = 'memory'; // Valid entity type

    await insertHelpers.insertMemory(db, entityId, 'm1');
    await insertHelpers.insertTag(db, tagId, 'qq');

    const response = await request(app).post(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Tag added successfully to entity.');
  });

  it('should return 400 when adding a non-existing tag to an entity', async () => {
    const entityId = uniqueIdPrefix + '1'; // Valid entity ID
    const tagId = '999'; // Non-existing tag ID
    const entityType = 'memory'; // Entity type

    const response = await request(app).post(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(400); // Expecting failure due to non-existent tag
    expect(response.body.message).toBe('Failed to add tag to entity.');
  });

  it('should remove a tag from an entity', async () => {
    const entityId = uniqueIdPrefix + '3'; // Valid entity ID
    const tagId = uniqueIdPrefix + '3'; // Valid tag ID
    const entityType = 'memory'; // Entity type

    await insertHelpers.insertMemory(db, entityId, 'm1');
    await insertHelpers.insertTag(db, tagId, 'qq');
    await insertHelpers.insertTagMemory(db, entityId, tagId);

    const response = await request(app).delete(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tag removed successfully from entity.');
  });

  it('should return 400 when trying to remove a non-existent tag from an entity', async () => {
    const entityId = uniqueIdPrefix + '1'; // Valid entity ID
    const tagId = '999'; // Non-existent tag ID
    const entityType = 'memory'; // Entity type

    const response = await request(app).delete(`/tag-extra/${entityType}/${entityId}/${tagId}`);
    expect(response.status).toBe(400); // Expecting failure due to non-existent tag
    expect(response.body.message).toBe('Failed to remove tag from entity.');
  });
});
