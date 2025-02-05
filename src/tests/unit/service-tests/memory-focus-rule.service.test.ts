import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { MemoryFocusRuleService } from '../../../services/sqlite-services/memory-focus-rule.service';
import { Pool } from 'pg';

let db: Pool;
let memoryFocusRuleService: MemoryFocusRuleService;

beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  memoryFocusRuleService = new MemoryFocusRuleService(db);
  await insertHelpers.presetMemoryFocusRuleTestData(db); // preset assistant "1" and rule "1"
});

beforeEach(async () => {
  // await db.query('TRUNCATE TABLE assistants, memories, owned_memories, focused_memories, memory_focus_rules RESTART IDENTITY CASCADE');

  await db.query('BEGIN'); // Begin transaction before each test
  await insertHelpers.insertAssistant(db, '1');
  await insertHelpers.insertMemoryFocusRule(db, '1', '1');
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

describe('Memory Focus Rule Service Tests', () => {
  test('getMemoryFocusRules - should fetch a memory focus rule by assistant ID', async () => {
    const rule = await memoryFocusRuleService.getMemoryFocusRules('1');
    expect(rule).toBeDefined();
    expect(rule?.id).toBe('1');
    expect(rule?.assistantId).toBe('1');
    expect(rule?.maxResults).toBe(5);
  });

  test('getMemoryFocusRules - should return null if no rule exists for the assistant ID', async () => {
    const rule = await memoryFocusRuleService.getMemoryFocusRules('non-existent-id');
    expect(rule).toBeNull();
  });

  test('updateMemoryFocusRule - should update a memory focus rule', async () => {
    const updates = {
      maxResults: 10,
      relationshipTypes: ['related_to', 'part_of'],
      priorityTags: ['tag1', 'tag2'],
    };
    const updated = await memoryFocusRuleService.updateMemoryFocusRule('1', updates);
    expect(updated).toBe(true);
    const rule = await memoryFocusRuleService.getMemoryFocusRules('1');
    expect(rule).toBeDefined();
    expect(rule?.maxResults).toBe(10);
    expect(rule?.relationshipTypes).toEqual(['related_to', 'part_of']);
    expect(rule?.priorityTags).toEqual(['tag1', 'tag2']);
  });

  test('updateMemoryFocusRule - should gracefully handle non-existent rule', async () => {
    const updates = { maxResults: 10, relationshipTypes: ['example_of'] };
    const updated = await memoryFocusRuleService.updateMemoryFocusRule('non-existent-id', updates);
    expect(updated).toBe(false);
  });

  test('removeMemoryFocusRule - should remove a memory focus rule', async () => {
    const removed = await memoryFocusRuleService.removeMemoryFocusRule('1');
    expect(removed).toBe(true);
    const rule = await memoryFocusRuleService.getMemoryFocusRules('1');
    expect(rule).toBeNull();
  });

  test('removeMemoryFocusRule - should gracefully handle non-existent rule', async () => {
    const removed = await memoryFocusRuleService.removeMemoryFocusRule('non-existent-id');
    expect(removed).toBe(false);
  });
});
