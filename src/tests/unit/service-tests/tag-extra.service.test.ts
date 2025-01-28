import Database from 'better-sqlite3';
import { TagExtraService } from '../../../services/sqlite-services/tag-extra.service';
let tagExtraService: TagExtraService;
describe('Tag Extra Service', () => {
  beforeAll(() => {
    const db = new Database(':memory:');
    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memory_tags (
        memory_id TEXT NOT NULL,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (memory_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS assistant_tags (
        assistant_id TEXT NOT NULL,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (assistant_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS task_tags (
        task_id TEXT NOT NULL,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
      );
    `);
    tagExtraService = new TagExtraService(db);
  });

  afterAll(() => {
    tagExtraService.db.close();
  });

  it('should add a tag to an entity', async () => {
    // Add a tag to the tags table
    const db = tagExtraService.db;
    db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)').run('tag1', 'responsive');

    // Associate the tag with a memory
    const added = await tagExtraService.addTagToEntity('memory1', 'tag1', 'memory');
    expect(added).toBe(true);

    // Verify the association
    const tags = tagExtraService.getTagsByEntity('memory1', 'memory');
    expect(tags.length).toBe(1);
    expect(tags[0]).toMatchObject({ id: 'tag1', name: 'responsive' });
  });

  it('should fetch tags associated with an entity', async () => {
    // Add another tag
    const db = tagExtraService.db;
    db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)').run('tag2', 'scalable');
    await tagExtraService.addTagToEntity('memory1', 'tag2', 'memory');

    // Fetch all tags for the memory
    const tags = tagExtraService.getTagsByEntity('memory1', 'memory');
    expect(tags.length).toBe(2);
    const tagNames = tags.map((tag) => tag.name);
    expect(tagNames).toContain('responsive');
    expect(tagNames).toContain('scalable');
  });

  it('should remove a tag from an entity', async () => {
    // Remove the 'responsive' tag from the memory
    const removed = await tagExtraService.removeTagFromEntity('memory1', 'tag1', 'memory');
    expect(removed).toBe(true);

    // Verify the tag is removed
    const tags = tagExtraService.getTagsByEntity('memory1', 'memory');
    expect(tags.length).toBe(1);
    expect(tags[0]).toMatchObject({ id: 'tag2', name: 'scalable' });
  });

  it('should return false when trying to remove a non-existent tag', async () => {
    const removed = await tagExtraService.removeTagFromEntity('memory1', 'nonexistent-tag', 'memory');
    expect(removed).toBe(false);
  });

  it('should handle associations for different entity types', async () => {
    // Add tags to an assistant and a task
    await tagExtraService.addTagToEntity('assistant1', 'tag2', 'assistant');
    await tagExtraService.addTagToEntity('task1', 'tag2', 'task');

    // Verify the tags for each entity type
    const assistantTags = tagExtraService.getTagsByEntity('assistant1', 'assistant');
    expect(assistantTags.length).toBe(1);
    expect(assistantTags[0]).toMatchObject({ id: 'tag2', name: 'scalable' });

    const taskTags = tagExtraService.getTagsByEntity('task1', 'task');
    expect(taskTags.length).toBe(1);
    expect(taskTags[0]).toMatchObject({ id: 'tag2', name: 'scalable' });
  });
});
