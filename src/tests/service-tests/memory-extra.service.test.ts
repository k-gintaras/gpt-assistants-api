import { memoryExtraService } from '../../services/memory-extra.service';
import { testDbHelper } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import Database from 'better-sqlite3';

let db: Database.Database;

beforeEach(() => {
  db = testDbHelper.initialize();
  memoryExtraService.setDb(db);

  // Insert necessary data
  insertHelpers.insertAssistant(db, '1'); // Ensure assistant exists
  insertHelpers.insertTags(db, '1'); // Ensure tags exist
  insertHelpers.insertMemories(db); // Ensure memories exist
  insertHelpers.insertMemoryFocusRule(db, '1', '1'); // Ensure memory focus rule exists

  // Optionally associate memories with focus rules
  db.prepare(
    `
    INSERT INTO focused_memories (memory_focus_id, memory_id)
    VALUES ('1', '1')
  `
  ).run();
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('memoryExtraService', () => {
  test('getAllMemories - should fetch all memories with tags', async () => {
    // Associate tags with memories
    db.prepare(
      `
    INSERT INTO memory_tags (memory_id, tag_id)
    VALUES ('1', '1'), ('1', '2')
  `
    ).run();

    const memories = await memoryExtraService.getAllMemories();
    expect(memories).toHaveLength(2); // before each insert memories adds 2 memories
    expect(memories[0].tags).toEqual(
      expect.arrayContaining([
        { id: '1', name: 'Tag1' },
        { id: '2', name: 'Tag2' },
      ])
    );
  });

  test('getMemoriesByTags - should fetch memories by specific tags', async () => {
    db.prepare(
      `
    INSERT INTO memory_tags (memory_id, tag_id)
    VALUES ('1', '1'), ('1', '2')
  `
    ).run();
    const memories = await memoryExtraService.getMemoriesByTags(['Tag1']);
    expect(memories).toHaveLength(1);
    expect(memories[0].id).toBe('1');
    expect(memories[0].tags).toEqual([{ id: '1', name: 'Tag1' }]);
  });

  test('getMemoriesByTags - should return empty array for non-existent tags', async () => {
    const memories = await memoryExtraService.getMemoriesByTags(['NonExistentTag']);
    expect(memories).toEqual([]);
  });

  test('getMemoriesByTags - should throw an error for empty tags array', async () => {
    await expect(memoryExtraService.getMemoriesByTags([])).rejects.toThrow('Tags array cannot be empty.');
  });

  test('updateMemoryTags - should add and remove tags', async () => {
    const result = await memoryExtraService.updateMemoryTags('1', ['Tag1', 'Tag2', 'Tag3']);
    expect(result).toBe(true);

    const memories = await memoryExtraService.getAllMemories();
    expect(memories[0].tags).toEqual(
      expect.arrayContaining([
        { id: '1', name: 'Tag1' },
        { id: '2', name: 'Tag2' },
        { name: 'Tag3', id: expect.any(String) },
      ])
    );

    // Remove Tag2
    await memoryExtraService.updateMemoryTags('1', ['Tag1']);
    const updatedMemories = await memoryExtraService.getAllMemories();
    expect(updatedMemories[0].tags).toEqual([{ id: '1', name: 'Tag1' }]);
  });

  test('updateMemoryTags - should throw an error for non-existent memory', async () => {
    await expect(memoryExtraService.updateMemoryTags('non-existent-id', ['Tag1'])).rejects.toThrow('Memory with ID non-existent-id not found.');
  });
});
