import { testDbHelper } from '../test-db.helper';
import Database from 'better-sqlite3';
import { insertHelpers } from '../test-db-insert.helper';
import { OwnedMemoryRow } from '../../../models/focused-memory.model';
import { OwnedMemoryService } from '../../../services/sqlite-services/owned-memory.service';

let db: Database.Database;
let ownedMemoryService: OwnedMemoryService;
beforeEach(() => {
  db = testDbHelper.initialize();
  ownedMemoryService = new OwnedMemoryService(db);
  // Insert test data
  insertHelpers.insertAssistant(db, '1'); // Ensure the assistant exists
  insertHelpers.insertMemories(db); // Insert memories
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('OwnedMemoryService Tests', () => {
  test('getMemoriesByAssistantId - should fetch owned memories by assistant ID', async () => {
    // Add owned memories
    await ownedMemoryService.addOwnedMemory('1', '1');
    await ownedMemoryService.addOwnedMemory('1', '2');

    const memories = await ownedMemoryService.getMemoriesByAssistantId('1');

    expect(memories).toHaveLength(2);
    expect(memories.map((m) => m.id)).toEqual(expect.arrayContaining(['1', '2']));
  });

  test('addOwnedMemory - should add a new owned memory', async () => {
    const result = await ownedMemoryService.addOwnedMemory('1', '1');
    expect(result).toBe(true);

    const rows = db.prepare('SELECT * FROM owned_memories WHERE assistant_id = ? AND memory_id = ?').all('1', '1');
    expect(rows).toHaveLength(1);
  });

  test('removeOwnedMemory - should remove an owned memory', async () => {
    // Add a memory first
    await ownedMemoryService.addOwnedMemory('1', '1');

    const removed = await ownedMemoryService.removeOwnedMemory('1', '1');
    expect(removed).toBe(true);

    const rows = db.prepare('SELECT * FROM owned_memories WHERE assistant_id = ? AND memory_id = ?').all('1', '1');
    expect(rows).toHaveLength(0);
  });

  test('updateOwnedMemories - should update owned memories for an assistant', async () => {
    // Add initial owned memory
    await ownedMemoryService.addOwnedMemory('1', '1');
    insertHelpers.insertMemory(db, '3');
    // Update to new memories
    await ownedMemoryService.updateOwnedMemories('1', ['2', '3']);

    const rows = db.prepare('SELECT * FROM owned_memories WHERE assistant_id = ?').all('1') as OwnedMemoryRow[];
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
    const result2 = await ownedMemoryService.addOwnedMemory('1', '1'); // Attempt duplicate

    expect(result1).toBe(true);
    expect(result2).toBe(false); // Duplicate should fail

    const rows = db.prepare('SELECT * FROM owned_memories WHERE assistant_id = ? AND memory_id = ?').all('1', '1');
    expect(rows).toHaveLength(1); // Only one entry should exist
  });

  test('removeOwnedMemory - should handle removing non-existent memory gracefully', async () => {
    const removed = await ownedMemoryService.removeOwnedMemory('1', 'non-existent-id');
    expect(removed).toBe(false); // Should gracefully return false
  });
});
