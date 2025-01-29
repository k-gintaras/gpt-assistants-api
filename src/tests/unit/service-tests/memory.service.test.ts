import { testDbHelper } from '../test-db.helper';
import Database from 'better-sqlite3';
import { Memory, MemoryRow } from '../../../models/memory.model';
import { MemoryService } from '../../../services/sqlite-services/memory.service';

let db: Database.Database;
let memoryService: MemoryService;

beforeEach(() => {
  db = testDbHelper.initialize();
  memoryService = new MemoryService(db);

  // Insert some sample tags for association
  db.prepare(`INSERT INTO tags (id, name) VALUES ('1', 'tag1'), ('2', 'tag2'), ('3', 'tag3')`).run();
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('MemoryService Tests', () => {
  test('addMemory - should add a new memory and return its ID', async () => {
    const memoryData: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'knowledge',
      description: 'Test memory description',
      data: JSON.stringify({ key: 'value' }),
    };

    const memoryId = await memoryService.addMemory(memoryData);

    expect(memoryId).toBeDefined();

    const memoryRow = db.prepare('SELECT * FROM memories WHERE id = ?').get(memoryId) as MemoryRow;
    expect(memoryRow).toBeDefined();
    expect(memoryRow.type).toBe('knowledge');
    expect(memoryRow.description).toBe('Test memory description');
    expect(JSON.parse(memoryRow.data!)).toEqual({ key: 'value' });
  });

  test('removeMemory - should remove an existing memory', async () => {
    // Insert a memory
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('test-id', 'knowledge', 'To remove', '{"key":"value"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString());

    await memoryService.removeMemory('test-id');

    const memoryRows = db.prepare('SELECT * FROM memories WHERE id = ?').all('test-id');
    expect(memoryRows).toHaveLength(0);
  });

  test('updateMemory - should update an existing memory', async () => {
    // Insert a memory
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('test-id', 'knowledge', 'Original description', '{"key":"original"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString());

    const updates = {
      description: 'Updated description',
      data: JSON.stringify({ key: 'updated' }),
    };

    await memoryService.updateMemory('test-id', updates);

    const updatedRow = db.prepare('SELECT * FROM memories WHERE id = ?').get('test-id') as MemoryRow;
    expect(updatedRow.description).toBe('Updated description');
    expect(JSON.parse(updatedRow.data!)).toEqual({ key: 'updated' });
  });

  test('updateMemory - should handle partial updates gracefully', async () => {
    // Insert a memory
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('test-id', 'knowledge', 'Original description', '{"key":"original"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString());

    const updates = {
      description: null, // Should retain the original description
    };

    await memoryService.updateMemory('test-id', updates);

    const updatedRow = db.prepare('SELECT * FROM memories WHERE id = ?').get('test-id') as MemoryRow;
    expect(updatedRow.description).toBe('Original description');
    expect(JSON.parse(updatedRow.data!)).toEqual({ key: 'original' });
  });

  test('updateMemory - should gracefully handle non-existent memory', () => {
    const result = memoryService.updateMemory('non-existent-id', { description: 'Does not exist' });

    // Ensure the result is false since the memory ID does not exist
    expect(result).toBe(false);

    // Check that no rows were updated in the database
    const rows = db.prepare('SELECT * FROM memories WHERE id = ?').all('non-existent-id');
    expect(rows).toHaveLength(0);
  });

  test('getMemoryById - should fetch a memory by ID', async () => {
    // Insert a memory
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES ('test-id', 'knowledge', 'Test description', '{"key":"value"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString());

    const memory = memoryService.getMemoryById('test-id');
    expect(memory).toBeDefined();
    expect(memory?.description).toBe('Test description');
    expect(memory).toBeDefined();
    expect(memory?.data).toBeDefined();
    expect(JSON.parse(memory!.data!)).toEqual({ key: 'value' });
  });

  test('getAllMemories - should fetch all memories', async () => {
    // Insert multiple memories
    db.prepare(
      `INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
       VALUES 
       ('test-id-1', 'knowledge', 'Memory 1', '{"key":"value1"}', ?, ?),
       ('test-id-2', 'instruction', 'Memory 2', '{"key":"value2"}', ?, ?)`
    ).run(new Date().toISOString(), new Date().toISOString(), new Date().toISOString(), new Date().toISOString());

    const memories = memoryService.getAllMemories();
    if (!memories) return;
    expect(memories).toHaveLength(2);

    const [memory1, memory2] = memories;
    expect(memory1.description).toBe('Memory 1');
    expect(JSON.parse(memory1.data!)).toEqual({ key: 'value1' });
    expect(memory2.description).toBe('Memory 2');
    expect(JSON.parse(memory2.data!)).toEqual({ key: 'value2' });
  });
});
