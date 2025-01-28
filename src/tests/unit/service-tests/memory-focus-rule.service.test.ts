import { testDbHelper } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { MemoryFocusRuleService } from '../../../services/sqlite-services/memory-focus-rule.service';

let db;
let memoryFocusRuleService: MemoryFocusRuleService;

beforeEach(() => {
  db = testDbHelper.initialize();
  memoryFocusRuleService = new MemoryFocusRuleService(db);

  // Insert initial data for tests
  insertHelpers.insertAssistant(db, '1'); // Ensure the assistant exists
  insertHelpers.insertMemoryFocusRule(db, '1', '1'); // Insert a focus rule
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('Memory Focus Rule Service Tests', () => {
  test('getMemoryFocusRules - should fetch a memory focus rule by assistant ID', async () => {
    const rule = await memoryFocusRuleService.getMemoryFocusRules('1');
    expect(rule).toBeDefined();
    expect(rule?.id).toBe('1');
    expect(rule?.assistantId).toBe('1');
    expect(rule?.maxResults).toBe(5); // Assuming 5 was the default in `testInserts`
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
    const updates = {
      maxResults: 10,
      relationshipTypes: ['example_of'],
    };

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
