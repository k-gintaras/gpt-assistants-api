import { TagExtraService } from '../../../services/sqlite-services/tag-extra.service';
import { insertHelpers } from '../test-db-insert.helper';
import { getDb } from '../test-db.helper';
import { Pool } from 'pg';
const tId = 'tagServiceId';
describe('Tag Extra Service', () => {
  let tagExtraService: TagExtraService;
  let db: Pool;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    tagExtraService = new TagExtraService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  afterEach(async () => {
    await db.query('ROLLBACK'); // Rollback changes after each test
  });
  beforeEach(async () => {
    await db.query('BEGIN'); // Start transaction for each test
  });

  it('should add a tag to an entity', async () => {
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag1', 'responsive']);
    await insertHelpers.insertMemory(db, tId + 'memory1', 'memory');
    const added = await tagExtraService.addTagToEntity(tId + 'memory1', tId + 'tag1', 'memory');
    expect(added).toBe(true);

    const tags = await tagExtraService.getTagsByEntity(tId + 'memory1', 'memory');
    expect(tags.length).toBe(1);
    expect(tags[0]).toMatchObject({ id: tId + 'tag1', name: 'responsive' });
  });

  it('should fetch tags associated with an entity', async () => {
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag2', 'scalable1']);
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag3', 'responsive1']);
    await insertHelpers.insertMemory(db, tId + 'memory1', 'memory');

    await tagExtraService.addTagToEntity(tId + 'memory1', tId + 'tag2', 'memory');
    await tagExtraService.addTagToEntity(tId + 'memory1', tId + 'tag3', 'memory');

    const tags = await tagExtraService.getTagsByEntity(tId + 'memory1', 'memory');
    expect(tags.length).toBe(2);
    const tagNames = tags.map((tag) => tag.name);
    expect(tagNames).toContain('responsive1');
    expect(tagNames).toContain('scalable1');
  });

  it('should remove a tag from an entity', async () => {
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag1', 'responsive']);
    await insertHelpers.insertMemory(db, tId + 'memory1', 'memory');

    await tagExtraService.addTagToEntity(tId + 'memory1', tId + 'tag1', 'memory');

    const removed = await tagExtraService.removeTagFromEntity(tId + 'memory1', tId + 'tag1', 'memory');
    expect(removed).toBe(true);

    const tags = await tagExtraService.getTagsByEntity(tId + 'memory1', 'memory');
    expect(tags.length).toBe(0);
  });

  it('should return false when trying to remove a non-existent tag', async () => {
    const removed = await tagExtraService.removeTagFromEntity(tId + 'memory1', 'nonexistent-tag', 'memory');
    expect(removed).toBe(false);
  });

  it('should handle associations for different entity types', async () => {
    await insertHelpers.insertAssistant(db, tId + 'assistant1');
    await insertHelpers.insertTask(db, tId + 'task1');
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag1', 'scalable1']);
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag2', 'scalable2']); // Change to 'scalable'

    await tagExtraService.addTagToEntity(tId + 'assistant1', tId + 'tag1', 'assistant');
    await tagExtraService.addTagToEntity(tId + 'task1', tId + 'tag2', 'task');

    const assistantTags = await tagExtraService.getTagsByEntity(tId + 'assistant1', 'assistant');

    expect(assistantTags.length).toBe(1);
    expect(assistantTags[0]).toMatchObject({ id: tId + 'tag1', name: 'scalable1' }); // Now expects 'scalable'

    const taskTags = await tagExtraService.getTagsByEntity(tId + 'task1', 'task');
    expect(taskTags.length).toBe(1);
    expect(taskTags[0]).toMatchObject({ id: tId + 'tag2', name: 'scalable2' }); // Same here
  });

  it('should add multiple tags to an entity', async () => {
    const tags = ['responsive', 'scalable', 'user-friendly'];

    await insertHelpers.insertMemory(db, tId + 'memory2', 'memory');

    const res = await db.query('SELECT * FROM memories where id=$1', [tId + 'memory2']);
    console.log('res.rows');
    console.log(res.rows);

    const added = await tagExtraService.addTagNamesToEntity(tId + 'memory2', tags, 'memory');
    expect(added).toBe(true);

    const entityTags = await tagExtraService.getTagsByEntity(tId + 'memory2', 'memory');
    const tagNames = entityTags.map((tag) => tag.name);

    expect(tagNames).toContain('responsive');
    expect(tagNames).toContain('scalable');
    expect(tagNames).toContain('user-friendly');
  });
});
