import { MemoryFocusRuleRow, MemoryFocusRule } from '../../../models/focused-memory.model';
import { transformMemoryFocusRuleRow } from '../../../transformers/memory-focus-rule.transformer';

describe('transformMemoryFocusRuleRow', () => {
  test('should correctly transform a valid MemoryFocusRuleRow into a MemoryFocusRule', () => {
    const row: MemoryFocusRuleRow = {
      id: 'rule-1',
      assistant_id: 'assistant-1',
      maxResults: 5,
      relationshipTypes: JSON.stringify(['related_to', 'example_of']),
      priorityTags: JSON.stringify(['tag1', 'tag2']),
      createdAt: new Date('2025-01-01T12:00:00Z').toISOString(),
      updatedAt: new Date('2025-01-02T12:00:00Z').toISOString(),
    };

    const result = transformMemoryFocusRuleRow(row);

    const expected: MemoryFocusRule = {
      id: 'rule-1',
      assistantId: 'assistant-1',
      maxResults: 5,
      relationshipTypes: ['related_to', 'example_of'],
      priorityTags: ['tag1', 'tag2'],
      createdAt: new Date('2025-01-01T12:00:00Z'),
      updatedAt: new Date('2025-01-02T12:00:00Z'),
    };

    expect(result).toEqual(expected);
  });

  test('should handle missing relationshipTypes and priorityTags by defaulting to empty arrays', () => {
    const row: MemoryFocusRuleRow = {
      id: 'rule-2',
      assistant_id: 'assistant-2',
      maxResults: 10,
      relationshipTypes: null,
      priorityTags: null,
      createdAt: new Date('2025-01-03T12:00:00Z').toISOString(),
      updatedAt: new Date('2025-01-04T12:00:00Z').toISOString(),
    };

    const result = transformMemoryFocusRuleRow(row);

    const expected: MemoryFocusRule = {
      id: 'rule-2',
      assistantId: 'assistant-2',
      maxResults: 10,
      relationshipTypes: [],
      priorityTags: [],
      createdAt: new Date('2025-01-03T12:00:00Z'),
      updatedAt: new Date('2025-01-04T12:00:00Z'),
    };

    expect(result).toEqual(expected);
  });
});
