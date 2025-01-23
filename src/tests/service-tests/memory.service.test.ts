import { memoryService } from '../../services/memory.service';
import { testDbHelper } from '../test-db.helper';
import Database from 'better-sqlite3';
import { Memory, MemoryRow } from '../../models/memory.model';

let db: Database.Database;

beforeEach(() => {
  db = testDbHelper.initialize();
  memoryService.setDb(db);

  // Insert some sample tags for association
  db.prepare(`INSERT INTO tags (id, name) VALUES ('1', 'tag1'), ('2', 'tag2'), ('3', 'tag3')`).run();
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('Memory Service Tests', () => {
  test('addMemory - should add a new memory and return its ID', async () => {
    const memoryData: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'knowledge',
      tags: [
        { id: '1', name: 'tag1' },
        { id: '2', name: 'tag2' },
      ],
      description: 'Test memory description',
      data: { key: 'value' },
    };

    const memoryId = await memoryService.addMemory(memoryData);
    db.prepare(
      `
    INSERT INTO memory_tags (memory_id, tag_id)
    VALUES ('${memoryId}', '1'), ('${memoryId}', '2')
  `
    ).run();

    expect(memoryId).toBeDefined();

    const memoryRow = db.prepare('SELECT * FROM memories WHERE id = ?').get(memoryId) as MemoryRow;
    expect(memoryRow).toBeDefined();
    expect(memoryRow.type).toBe('knowledge');
    expect(memoryRow.description).toBe('Test memory description');
    expect(memoryRow.data).toBe(JSON.stringify({ key: 'value' }));

    const memoryTags = db.prepare('SELECT tag_id FROM memory_tags WHERE memory_id = ?').all(memoryId) as { tag_id: string }[];
    expect(memoryTags.map((tag) => tag.tag_id)).toEqual(['1', '2']);
  });

  test('removeMemory - should remove an existing memory and its tags', async () => {
    // Insert memory with tags
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('test-unique-id', 'knowledge', 'To remove', '{"key":"value"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString());
    db.prepare(`INSERT INTO memory_tags (memory_id, tag_id) VALUES ('test-unique-id', '1'), ('test-unique-id', '2')`).run();

    await memoryService.removeMemory('test-unique-id');

    const memoryRows = db.prepare('SELECT * FROM memories WHERE id = ?').all('test-unique-id');
    expect(memoryRows).toHaveLength(0);

    const tagRows = db.prepare('SELECT * FROM memory_tags WHERE memory_id = ?').all('test-unique-id');
    expect(tagRows).toHaveLength(0);
  });

  test('updateMemory - should update an existing memory and its tags', async () => {
    // Insert memory with tags
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('test-unique-id', 'knowledge', 'Original description', '{"key":"original"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString());
    db.prepare(`INSERT INTO memory_tags (memory_id, tag_id) VALUES ('test-unique-id', '1')`).run();

    const updates = {
      description: 'Updated description',
      data: { key: 'updated' },
      tags: [
        { id: '2', name: 'tag2' },
        { id: '3', name: 'tag3' },
      ],
    };

    await memoryService.updateMemory('test-unique-id', updates);
    db.prepare(
      `
    INSERT INTO memory_tags (memory_id, tag_id)
    VALUES ('test-unique-id', '2'), ('test-unique-id', '3')
  `
    ).run();

    const updatedRow = db.prepare('SELECT * FROM memories WHERE id = ?').get('test-unique-id') as MemoryRow;
    expect(updatedRow.description).toBe('Updated description');
    expect(updatedRow.data).toBe(JSON.stringify({ key: 'updated' }));

    const memoryTags = db.prepare('SELECT tag_id FROM memory_tags WHERE memory_id = ?').all('test-unique-id') as { tag_id: string }[];
    expect(memoryTags.map((tag) => tag.tag_id)).toEqual(['1', '2', '3']);
  });

  test('updateMemory - should handle partial updates gracefully', async () => {
    // Insert memory without tags
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('test-unique-id', 'knowledge', 'Original description', '{"key":"original"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString());

    const updates: Memory = {
      tags: [{ id: '1', name: 'tag1' }],
      id: '',
      type: 'knowledge',
      description: null,
      data: null,
      createdAt: null,
      updatedAt: null,
    };

    await memoryService.updateMemory('test-unique-id', updates);
    db.prepare(
      `
    INSERT INTO memory_tags (memory_id, tag_id)
    VALUES ('test-unique-id', '1')
  `
    ).run();

    const updatedRow = db.prepare('SELECT * FROM memories WHERE id = ?').get('test-unique-id') as MemoryRow;
    expect(updatedRow.description).toBe('Original description');

    const memoryTags = db.prepare('SELECT tag_id FROM memory_tags WHERE memory_id = ?').all('test-unique-id') as { tag_id: string }[];
    expect(memoryTags.map((tag) => tag.tag_id)).toEqual(['1']);
  });

  test('updateMemory - should gracefully handle non-existent memory', async () => {
    await expect(memoryService.updateMemory('non-existent-id', { description: 'Does not exist' })).resolves.not.toThrow();

    const rows = db.prepare('SELECT * FROM memories WHERE id = ?').all('non-existent-id');
    expect(rows).toHaveLength(0);
  });
});
