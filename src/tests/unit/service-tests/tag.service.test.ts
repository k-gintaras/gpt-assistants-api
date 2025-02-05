import { Tag } from '../../../models/tag.model';
import { TagService } from '../../../services/sqlite-services/tag.service';
import { getDb } from '../test-db.helper';
import { Pool } from 'pg';

let db: Pool;
let tagService: TagService;

beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  tagService = new TagService(db);
});

beforeEach(async () => {
  await db.query('BEGIN'); // Start transaction for each test
});

afterEach(async () => {
  await db.query('DELETE FROM tags');

  await db.query('ROLLBACK'); // Rollback changes after each test
});

afterAll(async () => {
  await getDb.close();
});

describe('Tag Service Tests', () => {
  test('addTag - should add a new tag and return its ID', async () => {
    const tagData: Omit<Tag, 'id'> = {
      name: 'Test Tag',
    };

    const tagId = await tagService.addTag(tagData);

    expect(tagId).toBeDefined();
    const rows = await db.query('SELECT * FROM tags WHERE id = $1', [tagId]);
    expect(rows.rows).toHaveLength(1);

    const insertedTag = rows.rows[0] as Tag;
    expect(insertedTag.id).toBe(tagId);
    expect(insertedTag.name).toBe('Test Tag');
  });

  test('removeTag - should remove an existing tag', async () => {
    const tagId = 'test-tag-id';
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tagId, 'Test Tag']);

    const rowsBefore = await db.query('SELECT * FROM tags WHERE id = $1', [tagId]);
    expect(rowsBefore.rows).toHaveLength(1);

    await tagService.removeTag(tagId);

    const rowsAfter = await db.query('SELECT * FROM tags WHERE id = $1', [tagId]);
    expect(rowsAfter.rows).toHaveLength(0);
  });

  test('updateTag - should update an existing tag', async () => {
    const tagId = 'test-tag-id';
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tagId, 'Old Tag Name']);

    await tagService.updateTag(tagId, { name: 'Updated Tag Name' });

    const updatedRow = await db.query('SELECT * FROM tags WHERE id = $1', [tagId]);
    expect(updatedRow.rows).toBeDefined();
    expect(updatedRow.rows[0].name).toBe('Updated Tag Name');
  });

  test('getTagById - should fetch a tag by its ID', async () => {
    const tagId = 'test-tag-id';
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tagId, 'Test Tag']);

    const fetchedTag = await tagService.getTagById(tagId);
    expect(fetchedTag).toBeDefined();
    expect(fetchedTag?.id).toBe(tagId);
    expect(fetchedTag?.name).toBe('Test Tag');
  });

  test('getTagById - should return null for non-existent tag', async () => {
    const fetchedTag = await tagService.getTagById('non-existent-id');
    expect(fetchedTag).toBeNull();
  });

  test('getAllTags - should fetch all tags', async () => {
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2), ($3, $4)', ['1', 'Tag 1', '2', 'Tag 2']);

    const tags = await tagService.getAllTags();

    expect(tags).toBeDefined();
    expect(tags).toHaveLength(2);
    expect(tags.map((tag) => tag.name)).toEqual(expect.arrayContaining(['Tag 1', 'Tag 2']));
  });

  test('getAllTags - should return an empty array if no tags exist', async () => {
    const tags = await tagService.getAllTags();
    expect(tags).toBeDefined();
    expect(tags).toHaveLength(0);
  });
});
