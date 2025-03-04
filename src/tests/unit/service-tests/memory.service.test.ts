import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { Pool } from 'pg';
import { Memory } from '../../../models/memory.model';
import { MemoryService } from '../../../services/sqlite-services/memory.service';

let db: Pool;
let memoryService: MemoryService;

beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  memoryService = new MemoryService(db);
});

beforeEach(async () => {
  // await db.query('TRUNCATE TABLE assistants, memories, owned_memories, focused_memories, memory_focus_rules RESTART IDENTITY CASCADE');
  await db.query('BEGIN'); // Begin transaction before each test
  await insertHelpers.insertAssistant(db, '1');
  await insertHelpers.insertMemory(db, '1', 'Memory 1');
  await insertHelpers.insertMemory(db, '2', 'Memory 2');
  await insertHelpers.insertMemory(db, '3', 'Memory 3');
});

afterEach(async () => {
  await db.query('ROLLBACK');
});

afterAll(async () => {
  await getDb.close();
});

describe('MemoryService Tests', () => {
  test('addMemory - should add a new memory and return its ID', async () => {
    const memoryData: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'knowledge',
      description: 'Test memory description',
      data: JSON.stringify({ key: 'value' }),
      name: null,
      summary: null,
    };
    const memoryId = await memoryService.addMemory(memoryData);

    expect(memoryId).toBeDefined();

    const { rows } = await db.query('SELECT * FROM memories WHERE id = $1', [memoryId]);
    expect(rows[0]).toBeDefined();
    expect(rows[0].type).toBe('knowledge');
    expect(rows[0].description).toBe('Test memory description');
    expect(rows[0].data).toEqual({ key: 'value' });
  });

  test('removeMemory - should remove an existing memory', async () => {
    await insertHelpers.insertMemory(db, 'test-id', 'To remove');
    await memoryService.removeMemory('test-id');

    const { rows } = await db.query('SELECT * FROM memories WHERE id = $1', ['test-id']);
    expect(rows).toHaveLength(0);
  });

  test('updateMemory - should update an existing memory', async () => {
    await insertHelpers.insertMemory(db, 'test-id', 'Original description');
    const updates = { description: 'Updated description', data: JSON.stringify({ key: 'updated' }) };

    await memoryService.updateMemory('test-id', updates);
    const { rows } = await db.query('SELECT * FROM memories WHERE id = $1', ['test-id']);

    expect(rows[0].description).toBe('Updated description');
    expect(rows[0].data).toEqual({ key: 'updated' });
  });

  test('updateMemory - should handle partial updates gracefully', async () => {
    await insertHelpers.insertMemory(db, 'test-id', 'Original description');
    const updates = { description: null, data: JSON.stringify({ key: 'original' }) };

    await memoryService.updateMemory('test-id', updates);
    const { rows } = await db.query('SELECT * FROM memories WHERE id = $1', ['test-id']);

    expect(rows[0].description).toBe('Original description'); // Should remain unchanged
    expect(rows[0].data).toEqual({ key: 'original' });
  });

  test('updateMemory - should gracefully handle non-existent memory', async () => {
    const result = await memoryService.updateMemory('non-existent-id', { description: 'Does not exist' });

    expect(result).toBe(false);

    const { rows } = await db.query('SELECT * FROM memories WHERE id = $1', ['non-existent-id']);
    expect(rows).toHaveLength(0);
  });

  test('getMemoryById - should fetch a memory by ID', async () => {
    await insertHelpers.insertMemory(db, 'test-id', 'Test description');
    await db.query(`UPDATE memories SET data = $1 WHERE id = $2`, [JSON.stringify({ key: 'value' }), 'test-id']);

    const memory = await memoryService.getMemoryById('test-id');

    expect(memory).toBeDefined();
    expect(memory!.description).toBe('Test description');
    expect(memory!.data).toEqual({ key: 'value' });
  });

  test('getAllMemories - should fetch all memories', async () => {
    await insertHelpers.insertMemory(db, 'test-id-1', 'Memory 1');
    await db.query(`UPDATE memories SET data = $1 WHERE id = $2`, [JSON.stringify({ key: 'value1' }), 'test-id-1']);
    await insertHelpers.insertMemory(db, 'test-id-2', 'Memory 2');
    await db.query(`UPDATE memories SET data = $1 WHERE id = $2`, [JSON.stringify({ key: 'value2' }), 'test-id-2']);

    let memories = await memoryService.getAllMemories();

    // Filter out only test-specific inserted values
    memories = memories.filter((m) => ['test-id-1', 'test-id-2'].includes(m.id));

    expect(memories).toHaveLength(2);
    expect(memories[0].description).toBe('Memory 1');
    expect(memories[0].data).toEqual({ key: 'value1' });
    expect(memories[1].description).toBe('Memory 2');
    expect(memories[1].data).toEqual({ key: 'value2' });
  });
});
