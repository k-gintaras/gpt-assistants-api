import { AssistantWithDetails } from '../../../models/assistant.model';
import { FullAssistantRows, transformFullAssistantResult } from '../../../transformers/assistant-full.transformer';
import { testFullAssistantRows } from '../test-db-return.helper';
import { testFullAssistantObject } from '../test-object.helper';

describe('transformFullAssistantResult', () => {
  test('should transform rows into an AssistantWithDetails object', () => {
    const rows: FullAssistantRows[] = testFullAssistantRows;

    const result = transformFullAssistantResult(rows);

    expect(result).toBeDefined();
    expect(result).toMatchObject<AssistantWithDetails>(testFullAssistantObject);
  });

  test('should throw an error if no rows are provided', () => {
    expect(() => transformFullAssistantResult([])).toThrow('No rows provided for transformation.');
  });

  test('should handle rows with no tags', () => {
    const rows: FullAssistantRows[] = testFullAssistantRows.map((row) => ({
      ...row,
      assistant_tag_id: null,
      assistant_tag_name: null,
    }));

    const result = transformFullAssistantResult(rows);

    expect(result).toBeDefined();
    expect(result.assistantTags).toHaveLength(0); // No tags should be present
  });

  test('should handle rows with no memories', () => {
    const rows: FullAssistantRows[] = testFullAssistantRows.map((row) => ({
      ...row,
      memory_id: null,
      memory_type: null,
      memory_description: null,
      memory_data: null,
      memory_createdAt: null,
      memory_updatedAt: null,
      memory_tag_id: null,
      memory_tag_name: null,
    }));

    const result = transformFullAssistantResult(rows);

    expect(result).toBeDefined();
    expect(result.focusedMemories).toHaveLength(0); // No memories should be present
  });

  test('should handle rows with partial memory data', () => {
    const rows: FullAssistantRows[] = testFullAssistantRows.map((row, index) => ({
      ...row,
      memory_id: index === 0 ? '1' : null,
      memory_type: index === 0 ? 'knowledge' : null,
      memory_description: index === 0 ? 'Partial Memory' : null,
      memory_data: index === 0 ? '{"key":"value"}' : null,
      memory_createdAt: index === 0 ? new Date().toISOString() : null,
      memory_updatedAt: index === 0 ? new Date().toISOString() : null,
    }));

    const result = transformFullAssistantResult(rows);

    expect(result).toBeDefined();
    expect(result.focusedMemories).toHaveLength(1); // Only one memory should be present
    expect(result.focusedMemories[0]).toMatchObject({
      id: '1',
      type: 'knowledge',
      description: 'Partial Memory',
      data: '{"key":"value"}',
    });
  });

  describe('transformFullAssistantResult - No Tags', () => {
    test('should handle assistants with no tags gracefully', () => {
      const rows: FullAssistantRows[] = [
        {
          assistant_id: '1',
          assistant_name: 'Test Assistant',
          assistant_description: 'Test Description',
          assistant_type: 'chat',
          assistant_model: 'gpt-4o',
          avg_rating: '0',
          total_feedback: '0',
          assistant_created_at: new Date().toISOString(),
          assistant_updated_at: new Date().toISOString(),
          assistant_tag_id: null, // No tags
          assistant_tag_name: null, // No tags
          focus_rule_id: null,
          focus_rule_max_results: null,
          focus_rule_relationship_types: null,
          focus_rule_priority_tags: null,
          focus_rule_created_at: null,
          focus_rule_updated_at: null,
          memory_id: null,
          memory_type: null,
          memory_description: null,
          memory_data: null,
          memory_created_at: null,
          memory_updated_at: null,
          memory_tag_id: null,
          memory_tag_name: null,
          gpt_assistant_id: '',
          memory_name: null,
          memory_summary: null,
        },
      ];

      const result = transformFullAssistantResult(rows);

      expect(result).toBeDefined();
      expect(result.assistantTags).toHaveLength(0); // Ensure no tags are present
      expect(result.name).toBe('Test Assistant');
      expect(result.description).toBe('Test Description');
    });
  });

  test('should handle rows with no focus rule', () => {
    const rows: FullAssistantRows[] = testFullAssistantRows.map((row) => ({
      ...row,
      focus_rule_id: null,
      focus_rule_maxResults: null,
      focus_rule_relationshipTypes: null,
      focus_rule_priorityTags: null,
      focus_rule_createdAt: null,
      focus_rule_updatedAt: null,
    }));

    const result = transformFullAssistantResult(rows);

    expect(result).toBeDefined();
    expect(result.memoryFocusRule).toBeUndefined(); // Focus rule should be undefined
  });
});
