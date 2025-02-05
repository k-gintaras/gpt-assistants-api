import { getDb } from '../test-db.helper';
import { OwnedMemoryRow } from '../../../models/focused-memory.model';
import { Pool } from 'pg';
import { OwnedMemoryService } from '../../../services/sqlite-services/owned-memory.service';
import { insertHelpers } from '../test-db-insert.helper';

let db: Pool;
let ownedMemoryService: OwnedMemoryService;

beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  ownedMemoryService = new OwnedMemoryService(db);
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
  await getDb.close(); // Close database pool after all tests
});

describe('OwnedMemoryService Tests', () => {
  test('getMemoriesByAssistantId - should fetch owned memories by assistant ID', async () => {
    await ownedMemoryService.addOwnedMemory('1', '1');
    await ownedMemoryService.addOwnedMemory('1', '2');
    const memories = await ownedMemoryService.getMemoriesByAssistantId('1');
    expect(memories).toHaveLength(2);
    expect(memories.map((m) => m.id)).toEqual(expect.arrayContaining(['1', '2']));
  });

  test('addOwnedMemory - should add a new owned memory', async () => {
    const result = await ownedMemoryService.addOwnedMemory('1', '1');
    expect(result).toBe(true);
    const { rows } = await db.query('SELECT * FROM owned_memories WHERE assistant_id = $1 AND memory_id = $2', ['1', '1']);
    expect(rows).toHaveLength(1);
  });

  test('removeOwnedMemory - should remove an owned memory', async () => {
    await ownedMemoryService.addOwnedMemory('1', '1');
    const removed = await ownedMemoryService.removeOwnedMemory('1', '1');
    expect(removed).toBe(true);
    const { rows } = await db.query('SELECT * FROM owned_memories WHERE assistant_id = $1 AND memory_id = $2', ['1', '1']);
    expect(rows).toHaveLength(0);
  });

  test('updateOwnedMemories - should update owned memories for an assistant', async () => {
    await ownedMemoryService.addOwnedMemory('1', '1');
    await ownedMemoryService.updateOwnedMemories('1', ['2', '3']);
    const { rows } = await db.query('SELECT * FROM owned_memories WHERE assistant_id = $1', ['1']);
    expect(rows).toHaveLength(2);
    expect(rows.map((row: OwnedMemoryRow) => row.memory_id)).toEqual(expect.arrayContaining(['2', '3']));
  });

  test('getOwnedMemories - should return all owned memories for an assistant', async () => {
    await ownedMemoryService.addOwnedMemory('1', '1');
    await ownedMemoryService.addOwnedMemory('1', '2');
    const memories = await ownedMemoryService.getOwnedMemories('1');
    expect(memories).toHaveLength(2);
    expect(memories.map((m) => m.id)).toEqual(expect.arrayContaining(['1', '2']));
  });

  test('addOwnedMemory - should not add duplicate owned memory', async () => {
    const result1 = await ownedMemoryService.addOwnedMemory('1', '1');
    const result2 = await ownedMemoryService.addOwnedMemory('1', '1');
    expect(result1).toBe(true);
    expect(result2).toBe(false);
    const { rows } = await db.query('SELECT * FROM owned_memories WHERE assistant_id = $1 AND memory_id = $2', ['1', '1']);
    expect(rows).toHaveLength(1);
  });

  test('removeOwnedMemory - should handle removing non-existent memory gracefully', async () => {
    const removed = await ownedMemoryService.removeOwnedMemory('1', 'non-existent-id');
    expect(removed).toBe(false);
  });
});
