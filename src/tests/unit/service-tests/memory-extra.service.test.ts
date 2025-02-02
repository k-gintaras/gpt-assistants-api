import { testDbHelper } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import Database from 'better-sqlite3';
import { MemoryExtraService } from '../../../services/sqlite-services/memory-extra.service';

let db: Database.Database;
let memoryExtraService: MemoryExtraService;

beforeEach(() => {
  db = testDbHelper.initialize();
  memoryExtraService = new MemoryExtraService(db);

  // Insert necessary data for memories, tags, assistants, etc.
  insertHelpers.insertAssistant(db, '1'); // Insert an assistant with id '1'
  insertHelpers.insertTags(db, '1'); // Inserts tags (e.g. Tag1, Tag2)
  insertHelpers.insertMemories(db); // Inserts default memories (assumed IDs '1' and '2')
  insertHelpers.insertMemoryFocusRule(db, '1', '1'); // Inserts a memory focus rule for memory '1'

  // Optionally associate a memory with a focus rule.
  db.prepare(`INSERT INTO focused_memories (memory_focus_id, memory_id) VALUES ('1', '1')`).run();
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('MemoryExtraService Tests', () => {
  test('getAllMemoriesWithTags - should fetch all memories with associated tags', async () => {
    // Associate tags with memory '1'
    db.prepare(`INSERT INTO memory_tags (memory_id, tag_id) VALUES ('1', '1'), ('1', '2')`).run();

    const memories = await memoryExtraService.getAllMemoriesWithTags();
    // Ensure we have the expected number of unique memories
    expect(memories.length).toBeGreaterThanOrEqual(2);

    // Find the memory with id '1' and check its tags
    const mem1 = memories.find((m) => m.id === '1');
    expect(mem1).toBeDefined();
    expect(mem1!.tags).toEqual(
      expect.arrayContaining([
        { id: '1', name: 'Tag1' },
        { id: '2', name: 'Tag2' },
      ])
    );
  });

  test('getMemoriesByTags - should fetch memories by specific tag', async () => {
    db.prepare(`INSERT INTO memory_tags (memory_id, tag_id) VALUES ('1', '1'), ('1', '2')`).run();

    const memories = await memoryExtraService.getMemoriesByTags(['Tag1']);
    // Expect to fetch memory '1' (or any memory with Tag1)
    expect(memories.length).toBeGreaterThanOrEqual(1);
    const mem1 = memories.find((m) => m.id === '1');
    expect(mem1).toBeDefined();
    expect(mem1!.tags).toEqual(expect.arrayContaining([{ id: '1', name: 'Tag1' }]));
  });

  test('getMemoriesByTags - should return empty array for non-existent tag', async () => {
    const memories = await memoryExtraService.getMemoriesByTags(['NonExistentTag']);
    expect(memories).toEqual([]);
  });

  test('getMemoriesByTags - should throw error for empty tags array', async () => {
    await expect(memoryExtraService.getMemoriesByTags([])).rejects.toThrow('Tags array cannot be empty.');
  });

  test('updateMemoryTags - should add new tags and remove old ones correctly', async () => {
    // Initially associate Tag1 and Tag2 with memory '1'
    db.prepare(`INSERT INTO memory_tags (memory_id, tag_id) VALUES ('1', '1'), ('1', '2')`).run();

    // Update memory '1' to include Tag1, Tag2, and Tag3 (a new tag)
    const resultAdd = await memoryExtraService.updateMemoryTags('1', ['Tag1', 'Tag2', 'Tag3']);
    expect(resultAdd).toBe(true);

    let memories = await memoryExtraService.getAllMemoriesWithTags();
    const mem1 = memories.find((m) => m.id === '1');
    expect(mem1).toBeDefined();
    expect(mem1!.tags).toEqual(
      expect.arrayContaining([
        { id: '1', name: 'Tag1' },
        { id: '2', name: 'Tag2' },
        { id: expect.any(String), name: 'Tag3' },
      ])
    );

    // Now update memory '1' to only have Tag1; Tag2 and Tag3 should be removed.
    const resultRemove = await memoryExtraService.updateMemoryTags('1', ['Tag1']);
    expect(resultRemove).toBe(true);

    memories = await memoryExtraService.getAllMemoriesWithTags();
    const updatedMem1 = memories.find((m) => m.id === '1');
    expect(updatedMem1).toBeDefined();
    expect(updatedMem1!.tags).toEqual([{ id: '1', name: 'Tag1' }]);
  });

  test('findDirectMemory - should find a memory by matching query in data or description', async () => {
    // Insert a memory with known description and data.
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt) 
       VALUES ('directMemory', 'knowledge', 'Memory about testing', 'Test data content', ?, ?)`
    ).run(now, now);

    const memory = await memoryExtraService.findDirectMemory('testing');
    expect(memory).not.toBeNull();
    if (memory) {
      expect((memory.description && memory.description.toLowerCase()) || (memory.data && memory.data.toLowerCase())).toContain('testing');
    }
  });

  test('findMultipleMemories - should return multiple memory data strings based on query', async () => {
    // Insert multiple memories that match the query "Node"
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt) 
       VALUES ('mem1', 'knowledge', 'Memory 1 about Node', 'Data 1', ?, ?)`
    ).run(now, now);
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt) 
       VALUES ('mem2', 'knowledge', 'Memory 2 about Node', 'Data 2', ?, ?)`
    ).run(now, now);
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt) 
       VALUES ('mem3', 'knowledge', 'Memory 3 about Node', 'Data 3', ?, ?)`
    ).run(now, now);

    const results = await memoryExtraService.findMultipleMemories('Node', 2);
    expect(results.length).toBe(2);
    // Returned data strings should come from one of the inserted memories.
    expect(results).toEqual(expect.arrayContaining(['Data 1', 'Data 2']));
  });
});
