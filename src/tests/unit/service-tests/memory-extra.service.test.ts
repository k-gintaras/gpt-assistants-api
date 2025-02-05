import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import { MemoryExtraService } from '../../../services/sqlite-services/memory-extra.service';

let db: Pool;
let memoryExtraService: MemoryExtraService;
const mId = 'memoryExtraId';
beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  memoryExtraService = new MemoryExtraService(db);
});

beforeEach(async () => {
  // await db.query('TRUNCATE TABLE assistants, memories, owned_memories, focused_memories, memory_focus_rules RESTART IDENTITY CASCADE');

  await db.query('BEGIN'); // Begin transaction before each test
  await insertHelpers.presetMemoryExtraTestData(db); // Set the initial data once
});

afterEach(async () => {
  await db.query('ROLLBACK');
});
afterAll(async () => {
  await getDb.close(); // Close database pool after all tests
});

describe('MemoryExtraService Tests', () => {
  test('getAllMemoriesWithTags - should fetch all memories with associated tags', async () => {
    const memories = await memoryExtraService.getAllMemoriesWithTags();
    expect(memories.length).toBeGreaterThanOrEqual(1);
    const mem1 = memories.find((m) => m.id === mId + '1');
    expect(mem1).toBeDefined();
    expect(mem1!.tags).toEqual(
      expect.arrayContaining([
        { id: mId + '1', name: mId + 'Tag1' },
        { id: mId + '2', name: mId + 'Tag2' },
      ])
    );
  });

  test('getMemoriesByTags - should fetch memories by specific tag', async () => {
    const memories = await memoryExtraService.getMemoriesByTags([mId + 'Tag1']);
    expect(memories.length).toBeGreaterThanOrEqual(1);
    const mem1 = memories.find((m) => m.id === mId + '1');
    expect(mem1).toBeDefined();
    expect(mem1!.tags).toEqual(expect.arrayContaining([{ id: mId + '1', name: mId + 'Tag1' }]));
  });

  test('getMemoriesByTags - should return empty array for non-existent tag', async () => {
    const memories = await memoryExtraService.getMemoriesByTags(['NonExistentTag']);
    expect(memories).toEqual([]);
  });

  test('getMemoriesByTags - should throw error for empty tags array', async () => {
    await expect(memoryExtraService.getMemoriesByTags([])).rejects.toThrow('Tags array cannot be empty.');
  });

  test('updateMemoryTags - should add new tags and remove old ones correctly', async () => {
    const resultAdd = await memoryExtraService.updateMemoryTags(mId + '1', [mId + 'Tag1', mId + 'Tag2', mId + 'Tag3']);
    expect(resultAdd).toBe(true);

    let memories = await memoryExtraService.getAllMemoriesWithTags();
    const mem1 = memories.find((m) => m.id === mId + '1');
    expect(mem1).toBeDefined();
    expect(mem1!.tags).toEqual(
      expect.arrayContaining([
        { id: mId + '1', name: mId + 'Tag1' },
        { id: mId + '2', name: mId + 'Tag2' },
        { id: expect.any(String), name: mId + 'Tag3' },
      ])
    );

    const resultRemove = await memoryExtraService.updateMemoryTags(mId + '1', [mId + 'Tag1']);
    expect(resultRemove).toBe(true);

    memories = await memoryExtraService.getAllMemoriesWithTags();
    const updatedMem1 = memories.find((m) => m.id === mId + '1');
    expect(updatedMem1).toBeDefined();
    expect(updatedMem1!.tags).toEqual([{ id: mId + '1', name: mId + 'Tag1' }]);
  });

  test('findDirectMemory - should find a memory by matching query in data or description', async () => {
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO memories (id, type, description, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mId + 'directMemory', 'knowledge', 'Memory about testing', JSON.stringify('Test data content'), now, now]
    );

    const memory = await memoryExtraService.findDirectMemory('testing');
    expect(memory).not.toBeNull();
    if (memory) {
      expect(memory.description?.toLowerCase() || memory.data?.toLowerCase()).toContain('testing');
    }
  });

  test('findMultipleMemories - should return multiple memory data strings based on query', async () => {
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO memories (id, type, description, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mId + 'mem4', 'knowledge', 'Memory 1 about Node', JSON.stringify('Data 1'), now, now]
    );
    await db.query(
      `INSERT INTO memories (id, type, description, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mId + 'mem5', 'knowledge', 'Memory 2 about Node', JSON.stringify('Data 2'), now, now]
    );
    await db.query(
      `INSERT INTO memories (id, type, description, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mId + 'mem6', 'knowledge', 'Memory 3 about Node', JSON.stringify('Data 3'), now, now]
    );

    const results = await memoryExtraService.findMultipleMemories('Node', 2);
    expect(results.length).toBe(2);
    expect(results).toEqual(expect.arrayContaining(['Data 1', 'Data 2']));
  });
});
