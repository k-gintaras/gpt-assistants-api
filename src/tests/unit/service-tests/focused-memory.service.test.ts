import { Pool } from 'pg';
import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { FocusedMemoryService } from '../../../services/sqlite-services/focused-memory.service';

let db: Pool;
let focusedMemoryService: FocusedMemoryService;

beforeAll(async () => {
  jest.setTimeout(10000); // Increase timeout for tests to 10 seconds
  await getDb.initialize(); // Initialize DB only once
  db = getDb.getInstance();
  focusedMemoryService = new FocusedMemoryService(db);
});

beforeEach(async () => {
  await db.query('BEGIN'); // Start a new transaction for each test
  await insertHelpers.insertFocusedMemoryTestData(db); // Insert test data for focused memories
});

afterEach(async () => {
  await db.query('ROLLBACK'); // Rollback transaction to avoid polluting DB state
});

afterAll(async () => {
  await getDb.close(); // Close the DB connection after all tests
});

describe('Focused Memory Service Tests', () => {
  test('Should fetch limited focused memories by assistant ID', async () => {
    // Insert unique memories with expected descriptions
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1'); // Memory Description 1
    const memories = await focusedMemoryService.getLimitedFocusedMemoriesByAssistantId('focusedMemoryId' + '1');
    expect(memories).toHaveLength(1);
    expect(memories[0].description).toBe('Memory Description 1'); // Match the description you inserted
  });

  test('Should fetch all focused memories by focus rule ID', async () => {
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1'); // Memory Description 1
    const memories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('focusedMemoryId' + '1');
    expect(memories).toHaveLength(1);
    expect(memories[0].description).toBe('Memory Description 1'); // Match the description you inserted
  });

  test('Should enforce maxResults when fetching focused memories by assistant ID', async () => {
    // Insert unique memories with distinct descriptions for testing
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1'); // Memory 1
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '2'); // Memory 2
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '3'); // Memory 3

    // Update max_results for the focus rule to limit results to 2
    await db.query(`UPDATE memory_focus_rules SET max_results = $1 WHERE id = $2`, [2, 'focusedMemoryId' + '1']);

    // Fetch the memories and ensure we get the most recent ones based on max_results
    const memories = await focusedMemoryService.getLimitedFocusedMemoriesByAssistantId('focusedMemoryId' + '1');

    // Assert that we get 2 memories (max_results)
    expect(memories).toHaveLength(2);

    // Assert that the descriptions are correct (most recent first)
    expect(memories.map((m) => m.description)).toEqual(
      expect.arrayContaining([
        'Memory Description 3', // Latest memory
        'Memory Description 2', // Second latest memory
      ])
    );
  });

  test('Should fetch all focused memories by rule ID without limit', async () => {
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1');
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '2');
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '3');
    await db.query(`UPDATE memory_focus_rules SET max_results = $1 WHERE id = $2`, [2, 'focusedMemoryId' + '1']);
    const memories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('focusedMemoryId' + '1');
    expect(memories).toHaveLength(3);
  });

  test('Should add a focused memory', async () => {
    const valid = await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '2', 'focusedMemoryId' + '1');
    expect(valid).toBe(true);
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1');
    const duplicate = await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1');
    expect(duplicate).toBe(false);
    const invalidFocus = await focusedMemoryService.addFocusedMemory('invalid-focus', 'focusedMemoryId' + '1');
    expect(invalidFocus).toBe(false);
    const invalidMemory = await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'invalid-memory');
    expect(invalidMemory).toBe(false);
  });

  test('Should remove a focused memory', async () => {
    await insertHelpers.insertMemory(db, 'focusedMemoryId' + '1-memory', 'focusedMemoryId' + '1-memory');
    await focusedMemoryService.addFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1-memory');
    const pre = await db.query('SELECT * FROM focused_memories WHERE memory_focus_id = $1 AND memory_id = $2', ['focusedMemoryId' + '1', 'focusedMemoryId' + '1-memory']);
    expect(pre.rowCount).toBe(1);
    const removed = await focusedMemoryService.removeFocusedMemory('focusedMemoryId' + '1', 'focusedMemoryId' + '1-memory');
    expect(removed).toBe(true);
    const post = await db.query('SELECT * FROM focused_memories WHERE memory_focus_id = $1 AND memory_id = $2', ['focusedMemoryId' + '1', 'focusedMemoryId' + '1-memory']);
    expect(post.rowCount).toBe(0);
  });

  test('Should update focused memories and enforce new list', async () => {
    const newMemoryIds = ['focusedMemoryId' + '4', 'focusedMemoryId' + '5'];
    await db.query(
      `INSERT INTO memories (id, type, description, created_at, updated_at)
       VALUES ($1, 'knowledge', $2, $3, $3), ($4, 'knowledge', $5, $6, $6)`,
      ['focusedMemoryId' + '4', 'Second Memory', new Date().toISOString(), 'focusedMemoryId' + '5', 'Third Memory', new Date().toISOString()]
    );
    await focusedMemoryService.updateFocusedMemories('focusedMemoryId' + '1', newMemoryIds);
    const memories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('focusedMemoryId' + '1');
    expect(memories).toHaveLength(2);
    expect(memories.map((m) => m.description)).toEqual(expect.arrayContaining(['Second Memory', 'Third Memory']));
  });

  test('Should handle no focused memories gracefully', async () => {
    const memories = await focusedMemoryService.getAllFocusedMemoriesByRuleId('nonexistent-focus-rule');
    expect(memories).toEqual([]);
  });
});
