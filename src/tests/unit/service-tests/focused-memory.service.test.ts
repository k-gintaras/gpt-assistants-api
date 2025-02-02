import Database from 'better-sqlite3';
import { testDbHelper } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { FocusedMemoryService } from '../../../services/sqlite-services/focused-memory.service';

let db: Database.Database;
let focusedMemoryService: FocusedMemoryService;

beforeEach(() => {
  db = testDbHelper.initialize();
  focusedMemoryService = new FocusedMemoryService(db);

  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertMemoriesX3(db); // Inserts memories with IDs 1,2
  insertHelpers.insertMemoryFocusRule(db, '1', '1'); // Insert focus rule
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('Focused Memory Service Tests', () => {
  test('Should fetch limited focused memories by assistant ID', async () => {
    await focusedMemoryService.addFocusedMemory('1', '1');

    const focusedMemories = await focusedMemoryService.getLimitedFocusedMemoriesByAssistantId('1');
    expect(focusedMemories).toBeDefined();
    expect(focusedMemories).toHaveLength(1);
    expect(focusedMemories[0].description).toBe('Memory Description');
  });

  test('Should fetch all focused memories by focus rule ID', async () => {
    await focusedMemoryService.addFocusedMemory('1', '1');

    const focusedMemories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('1');
    expect(focusedMemories).toBeDefined();
    expect(focusedMemories).toHaveLength(1);
    expect(focusedMemories[0].description).toBe('Memory Description');
  });

  test('Should enforce maxResults when fetching focused memories by assistant ID', async () => {
    // Add all three memories to the focus group
    await focusedMemoryService.addFocusedMemory('1', '1');
    await focusedMemoryService.addFocusedMemory('1', '2');
    await focusedMemoryService.addFocusedMemory('1', '3');

    // Set maxResults to 2 in the focus rule
    db.prepare(`UPDATE memory_focus_rules SET maxResults = ? WHERE id = ?`).run(2, '1');

    const focusedMemories = await focusedMemoryService.getLimitedFocusedMemoriesByAssistantId('1');
    // Verify only 2 most recent memories are returned
    expect(focusedMemories).toHaveLength(2);
    expect(focusedMemories.map((mem) => mem.description)).toEqual(expect.arrayContaining(['Memory Description 3', 'Another Memory Description']));
  });

  test('Should fetch all focused memories by rule ID without limit', async () => {
    // Add all three memories
    await focusedMemoryService.addFocusedMemory('1', '1');
    await focusedMemoryService.addFocusedMemory('1', '2');
    await focusedMemoryService.addFocusedMemory('1', '3');

    // Set maxResults to 2 but fetch by rule ID (which ignores maxResults)
    db.prepare(`UPDATE memory_focus_rules SET maxResults = ? WHERE id = ?`).run(2, '1');

    const focusedMemories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('1');
    expect(focusedMemories).toHaveLength(3); // Should return all, ignoring limits
  });

  test('Should add a focused memory', async () => {
    const validAdd = await focusedMemoryService.addFocusedMemory('1', '1');
    expect(validAdd).toBe(true);

    // Attempt duplicate addition
    const duplicateAdd = await focusedMemoryService.addFocusedMemory('1', '1');
    expect(duplicateAdd).toBe(false);

    // Attempt invalid memory focus ID
    const invalidFocusAdd = await focusedMemoryService.addFocusedMemory('invalid-focus', '1');
    expect(invalidFocusAdd).toBe(false);

    // Attempt invalid memory ID
    const invalidMemoryAdd = await focusedMemoryService.addFocusedMemory('1', 'invalid-memory');
    expect(invalidMemoryAdd).toBe(false);
  });

  test('Should remove a focused memory', async () => {
    insertHelpers.insertMemory(db, '1-memory');
    await focusedMemoryService.addFocusedMemory('1', '1-memory');

    const preRemoveRows = db.prepare('SELECT * FROM focused_memories WHERE memory_focus_id = ? AND memory_id = ?').all('1', '1-memory');
    expect(preRemoveRows).toHaveLength(1);

    const removed = await focusedMemoryService.removeFocusedMemory('1', '1-memory');
    expect(removed).toBe(true);

    const postRemoveRows = db.prepare('SELECT * FROM focused_memories WHERE memory_focus_id = ? AND memory_id = ?').all('1', '1-memory');
    expect(postRemoveRows).toHaveLength(0);
  });

  test('Should update focused memories and enforce new list', async () => {
    const newMemoryIds = ['4', '5'];

    // Insert new memories
    db.prepare(
      `
      INSERT INTO memories (id, type, description, createdAt, updatedAt)
      VALUES ('4', 'knowledge', 'Second Memory', '${new Date().toISOString()}', '${new Date().toISOString()}'),
             ('5', 'knowledge', 'Third Memory', '${new Date().toISOString()}', '${new Date().toISOString()}')
      `
    ).run();

    await focusedMemoryService.updateFocusedMemories('1', newMemoryIds);

    const focusedMemories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('1');
    expect(focusedMemories).toHaveLength(2);
    expect(focusedMemories.map((mem) => mem.description)).toEqual(expect.arrayContaining(['Second Memory', 'Third Memory']));
  });

  test('Should handle no focused memories gracefully', async () => {
    const focusedMemories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('nonexistent-focus-rule');
    expect(focusedMemories).toEqual([]);
  });
});
