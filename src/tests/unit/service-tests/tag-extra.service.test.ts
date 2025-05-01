import { TagExtraService } from '../../../services/sqlite-services/tag-extra.service';
import { insertHelpers } from '../test-db-insert.helper';
import { getDb } from '../test-db.helper';
import { Pool } from 'pg';
const tId = 'tagServiceId2';
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

  beforeEach(async () => {
    await db.query('BEGIN');

    // Clear tags table to avoid conflicts with existing tags
    await db.query('DELETE FROM tags');

    // Insert required data (assistants, tasks, tags, etc.)
    await insertHelpers.insertAssistant(db, tId + 'assistant1');
    await insertHelpers.insertTask(db, tId + 'task1', 'Sample Task', tId + 'assistant1', 'pending');
    await insertHelpers.insertTag(db, tId + 'tag1', 'scalable1');
    await insertHelpers.insertTag(db, tId + 'tag2', 'scalable2');
    await insertHelpers.insertMemory(db, tId + 'memory1', 'memory');
    await insertHelpers.insertTagMemory(db, tId + 'memory1', tId + 'tag1');
  });

  afterEach(async () => {
    await db.query('DELETE FROM chat_messages'); // Clean up chat_messages table
    await db.query('DELETE FROM chats'); // Clean up chats table
    await db.query('DELETE FROM sessions'); // Clean up sessions table
    await db.query('DELETE FROM assistants'); // Clean up assistants table
    await db.query('DELETE FROM tasks'); // Clean up tasks table
    await db.query('DELETE FROM memories'); // Clean up memories table
    await db.query('ROLLBACK'); // Rollback changes after each test
  });

  it('should add a tag to an entity', async () => {
    const uniqueTagId = Math.random().toString(36).substring(7); // Generate a unique tag ID
    const uniqueTagName = Math.random().toString(36).substring(7); // Generate a unique tag name

    // Ensure tag is only inserted once
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [uniqueTagId, uniqueTagName]);

    await insertHelpers.insertMemory(db, tId + 'memory24', 'memory'); // Ensure memory is inserted before associating it with the tag
    const added = await tagExtraService.addTagToEntity(tId + 'memory24', uniqueTagId, 'memory');
    expect(added).toBe(true);

    // Get the tags for the entity
    const tags = await tagExtraService.getTagsByEntity(tId + 'memory24', 'memory');
    expect(tags.length).toBe(1); // Only one tag should be associated
    expect(tags[0]).toMatchObject({ id: uniqueTagId, name: uniqueTagName });
  });

  it('should fetch tags associated with an entity', async () => {
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag3', 'scalable12']);
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag4', 'responsive12']);
    await insertHelpers.insertMemory(db, tId + 'memory13', 'memory');

    await tagExtraService.addTagToEntity(tId + 'memory13', tId + 'tag3', 'memory');
    await tagExtraService.addTagToEntity(tId + 'memory13', tId + 'tag4', 'memory');

    const tags = await tagExtraService.getTagsByEntity(tId + 'memory13', 'memory');
    expect(tags.length).toBe(2);
    const tagNames = tags.map((tag) => tag.name);
    expect(tagNames).toContain('responsive12');
    expect(tagNames).toContain('scalable12');
  });

  it('should remove a tag from an entity', async () => {
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2)', [tId + 'tag5', tId + 'responsive']);
    await insertHelpers.insertMemory(db, tId + 'memory12', 'memory');

    await tagExtraService.addTagToEntity(tId + 'memory12', tId + 'tag5', 'memory');

    const removed = await tagExtraService.removeTagFromEntity(tId + 'memory12', tId + 'tag5', 'memory');
    expect(removed).toBe(true);

    const tags = await tagExtraService.getTagsByEntity(tId + 'memory12', 'memory');
    expect(tags.length).toBe(0);
  });

  it('should return false when trying to remove a non-existent tag', async () => {
    const removed = await tagExtraService.removeTagFromEntity(tId + 'memory1', 'nonexistent-tag', 'memory');
    expect(removed).toBe(false);
  });

  it('should handle associations for different entity types', async () => {
    // Ensure unique tags are inserted
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [tId + 'tag1', 'scalable1']);
    await db.query('INSERT INTO tags (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [tId + 'tag2', 'scalable2']);

    await insertHelpers.insertAssistant(db, tId + 'assistant1');
    await insertHelpers.insertTask(db, tId + 'task1', 'Sample Task', tId + 'assistant1', 'pending');

    // Add tags to entities
    await tagExtraService.addTagToEntity(tId + 'assistant1', tId + 'tag1', 'assistant');
    await tagExtraService.addTagToEntity(tId + 'task1', tId + 'tag2', 'task');

    // Fetch tags for the assistant
    const assistantTags = await tagExtraService.getTagsByEntity(tId + 'assistant1', 'assistant');
    expect(assistantTags.length).toBe(1);
    expect(assistantTags[0]).toMatchObject({ id: tId + 'tag1', name: 'scalable1' });

    // Fetch tags for the task
    const taskTags = await tagExtraService.getTagsByEntity(tId + 'task1', 'task');
    expect(taskTags.length).toBe(1);
    expect(taskTags[0]).toMatchObject({ id: tId + 'tag2', name: 'scalable2' });
  });

  it('should add multiple tags to an entity', async () => {
    const uniqueTagId1 = Math.random().toString(36).substring(7);
    const tags = [uniqueTagId1 + 'responsive', uniqueTagId1 + 'scalable', uniqueTagId1 + 'user-friendly'];

    await insertHelpers.insertMemory(db, uniqueTagId1 + 'memory2', 'memory');

    const added = await tagExtraService.addTagNamesToEntity(uniqueTagId1 + 'memory2', tags, 'memory');
    expect(added).toBe(true);

    const entityTags = await tagExtraService.getTagsByEntity(uniqueTagId1 + 'memory2', 'memory');
    const tagNames = entityTags.map((tag) => tag.name);

    expect(tagNames).toContain(uniqueTagId1 + 'responsive');
    expect(tagNames).toContain(uniqueTagId1 + 'scalable');
    expect(tagNames).toContain(uniqueTagId1 + 'user-friendly');
  });
});
