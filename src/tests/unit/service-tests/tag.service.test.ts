import { tagService } from '../../../services/tag.service';
import { testDbHelper } from '../test-db.helper';
import Database from 'better-sqlite3';
import { Tag, TagRow } from '../../../models/tag.model';

let db: Database.Database;

beforeEach(() => {
  db = testDbHelper.initialize();
  tagService.setDb(db);
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('Tag Service Tests', () => {
  test('addTag - should add a new tag and return its ID', async () => {
    const tagData: Omit<Tag, 'id'> = {
      name: 'Test Tag',
    };

    const tagId = await tagService.addTag(tagData);

    expect(tagId).toBeDefined();
    const rows = db.prepare('SELECT * FROM tags WHERE id = ?').all(tagId);
    expect(rows).toHaveLength(1);

    const insertedTag = rows[0] as Tag;
    expect(insertedTag.id).toBe(tagId);
    expect(insertedTag.name).toBe('Test Tag');
  });

  test('removeTag - should remove an existing tag', async () => {
    const tagId = 'test-tag-id';
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'Test Tag');

    const rowsBefore = db.prepare('SELECT * FROM tags WHERE id = ?').all(tagId);
    expect(rowsBefore).toHaveLength(1);

    await tagService.removeTag(tagId);

    const rowsAfter = db.prepare('SELECT * FROM tags WHERE id = ?').all(tagId);
    expect(rowsAfter).toHaveLength(0);
  });

  test('updateTag - should update an existing tag', async () => {
    const tagId = 'test-tag-id';
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'Old Tag Name');

    await tagService.updateTag(tagId, { name: 'Updated Tag Name' });

    const updatedRow = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId) as TagRow;
    expect(updatedRow).toBeDefined();
    expect(updatedRow.name).toBe('Updated Tag Name');
  });

  test('getTagById - should fetch a tag by its ID', async () => {
    const tagId = 'test-tag-id';
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'Test Tag');

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
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?), (?, ?)`).run('1', 'Tag 1', '2', 'Tag 2');

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
