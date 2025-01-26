import Database from 'better-sqlite3';
import { focusedMemoryService } from '../../../services/focused-memory.service';
import { testDbHelper } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';

let db: Database.Database;

beforeEach(() => {
  db = testDbHelper.initialize();
  focusedMemoryService.setDb(db);

  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertMemories(db); // Insert memories ids 1,2
  insertHelpers.insertMemoryFocusRule(db, '1', '1'); // Insert focus rule

  // Explicitly add focused memory for test setup
  // testInserts.insertFocusedMemory(db, '1', '1');
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('Focused Memory Service Tests', () => {
  test('Should fetch focused memories by assistant ID', async () => {
    await focusedMemoryService.addFocusedMemory('1', '1');

    const focusedMemories = await focusedMemoryService.getFocusedMemoriesByAssistantId('1');
    expect(focusedMemories).toBeDefined();
    expect(focusedMemories).toHaveLength(1);
    expect(focusedMemories[0].description).toBe('Memory Description');
  });

  test('Should fetch focused memories by focus ID', async () => {
    await focusedMemoryService.addFocusedMemory('1', '1');

    const focusedMemories = await focusedMemoryService.getFocusedMemories('1');
    expect(focusedMemories).toBeDefined();
    expect(focusedMemories).toHaveLength(1);
    expect(focusedMemories[0].description).toBe('Memory Description');
  });

  test('Should add a focused memory', async () => {
    // Add valid focused memory
    const validAdd = await focusedMemoryService.addFocusedMemory('1', '1');
    expect(validAdd).toBe(true);

    // Attempt to add duplicate memory
    const duplicateAdd = await focusedMemoryService.addFocusedMemory('1', '1');
    expect(duplicateAdd).toBe(false);

    // Attempt to add invalid memory focus ID
    const invalidFocusAdd = await focusedMemoryService.addFocusedMemory('invalid-focus', '1');
    expect(invalidFocusAdd).toBe(false);

    // Attempt to add invalid memory ID
    const invalidMemoryAdd = await focusedMemoryService.addFocusedMemory('1', 'invalid-memory');
    expect(invalidMemoryAdd).toBe(false);
  });

  test('Should handle foreign key constraint violation gracefully', async () => {
    const result = await focusedMemoryService.addFocusedMemory('invalid-focus-rule', '1-memory');
    expect(result).toBe(false);
  });

  test('Should remove a focused memory', async () => {
    insertHelpers.insertMemory(db, '1-memory');
    await focusedMemoryService.addFocusedMemory('1', '1-memory');

    // Confirm the entry exists before deletion
    const preRemoveRows = db.prepare('SELECT * FROM focused_memories WHERE memory_focus_id = ? AND memory_id = ?').all('1', '1-memory');
    expect(preRemoveRows).toHaveLength(1); // Ensure the entry exists

    const removed = await focusedMemoryService.removeFocusedMemory('1', '1-memory');
    expect(removed).toBe(true); // Check if deletion was successful

    const postRemoveRows = db.prepare('SELECT * FROM focused_memories WHERE memory_focus_id = ? AND memory_id = ?').all('1', '1-memory');
    expect(postRemoveRows).toHaveLength(0); // Ensure the entry no longer exists
  });

  test('Should handle removing nonexistent focused memory gracefully', async () => {
    const result = await focusedMemoryService.removeFocusedMemory('1', 'nonexistent-memory');
    expect(result).toBe(false);
  });

  test('Should update focused memories', async () => {
    const newMemoryIds = ['5', '4'];

    // Insert additional memories
    db.prepare(
      `
      INSERT INTO memories (id, type, description, createdAt, updatedAt)
      VALUES ('4', 'knowledge', 'Second Memory', '${new Date().toISOString()}', '${new Date().toISOString()}'),
             ('5', 'knowledge', 'Third Memory', '${new Date().toISOString()}', '${new Date().toISOString()}')
    `
    ).run();

    await focusedMemoryService.updateFocusedMemories('1', newMemoryIds);

    const focusedMemories = await focusedMemoryService.getFocusedMemories('1');
    expect(focusedMemories).toHaveLength(2);
    expect(focusedMemories.map((mem) => mem.description)).toEqual(expect.arrayContaining(['Second Memory', 'Third Memory']));
  });

  test('Should handle no focused memories gracefully', async () => {
    const focusedMemories = await focusedMemoryService.getFocusedMemories('nonexistent-focus-rule');
    expect(focusedMemories).toEqual([]); // Ensure it handles missing data gracefully
  });

  test('Should handle no focused memories gracefully', async () => {
    const focusedMemories = await focusedMemoryService.getFocusedMemories('non-existent-id');
    expect(focusedMemories).toEqual([]);
  });
});
