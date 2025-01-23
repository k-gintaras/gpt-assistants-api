import { AssistantRow } from '../../models/assistant.model';
import { MemoryFocusRuleRow } from '../../models/focused-memory.model';
import { MemoryRow } from '../../models/memory.model';
import { TagRow } from '../../models/tag.model';
import { transformAssistantRow, transformAssistantWithDetails } from '../../transformers/assistant.transformer';

// Mock Data
const mockAssistantRow: AssistantRow = {
  id: 'assistant-1',
  name: 'Test Assistant',
  description: 'A description for the assistant',
  type: 'completion',
  instructions: null,
  feedback_positive: 10,
  feedback_negative: 2,
  feedback_lastFeedbackDate: '2023-01-01T00:00:00.000Z',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-02T00:00:00.000Z',
};

const mockMemoryRows: MemoryRow[] = [
  {
    id: 'memory-1',
    type: 'knowledge',
    description: 'Memory description',
    data: JSON.stringify({ key: 'value' }),
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
];

const mockMemoryTags = {
  'memory-1': [
    { id: 'tag-1', name: 'Tag 1' },
    { id: 'tag-2', name: 'Tag 2' },
  ],
};

const mockAssistantTags: TagRow[] = [
  { id: 'tag-3', name: 'Assistant Tag 1' },
  { id: 'tag-4', name: 'Assistant Tag 2' },
];

const mockMemoryFocusRuleRow: MemoryFocusRuleRow = {
  id: 'focus-rule-1',
  assistant_id: 'assistant-1',
  maxResults: 5,
  relationshipTypes: JSON.stringify(['related_to']),
  priorityTags: JSON.stringify(['important']),
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-02T00:00:00.000Z',
};

// Tests
describe('transformAssistantRow', () => {
  test('should transform an AssistantRow into an Assistant object', () => {
    const result = transformAssistantRow(mockAssistantRow);

    expect(result).toBeDefined();
    expect(result.id).toBe('assistant-1');
    expect(result.name).toBe('Test Assistant');
    expect(result.description).toBe('A description for the assistant');
    expect(result.type).toBe('completion');
    expect(result.instructions).toBeUndefined(); // Null should be transformed to undefined
    expect(result.feedback).toEqual({
      positive: 10,
      negative: 2,
      lastFeedbackDate: new Date('2023-01-01T00:00:00.000Z'),
    });
    expect(result.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    expect(result.updatedAt).toEqual(new Date('2023-01-02T00:00:00.000Z'));
  });
});

describe('transformAssistantWithDetails', () => {
  test('should transform an AssistantRow with details into an AssistantWithDetails object', () => {
    const result = transformAssistantWithDetails(mockAssistantRow, mockMemoryRows, mockMemoryTags, mockAssistantTags, mockMemoryFocusRuleRow);

    expect(result).toBeDefined();
    expect(result.id).toBe('assistant-1');
    expect(result.name).toBe('Test Assistant');
    expect(result.assistantTags).toHaveLength(2);
    expect(result.assistantTags).toEqual([
      { id: 'tag-3', name: 'Assistant Tag 1' },
      { id: 'tag-4', name: 'Assistant Tag 2' },
    ]);
    expect(result.focusedMemories).toHaveLength(1);
    expect(result.focusedMemories[0]).toMatchObject({
      id: 'memory-1',
      type: 'knowledge',
      description: 'Memory description',
      tags: [
        { id: 'tag-1', name: 'Tag 1' },
        { id: 'tag-2', name: 'Tag 2' },
      ],
    });
    expect(result.memoryFocusRule).toMatchObject({
      id: 'focus-rule-1',
      assistantId: 'assistant-1',
      maxResults: 5,
      relationshipTypes: ['related_to'],
      priorityTags: ['important'],
    });
  });

  test('should handle null memory focus rule gracefully', () => {
    const result = transformAssistantWithDetails(mockAssistantRow, mockMemoryRows, mockMemoryTags, mockAssistantTags);

    expect(result).toBeDefined();
    expect(result.memoryFocusRule).toBeUndefined();
  });

  test('should handle empty memory rows gracefully', () => {
    const result = transformAssistantWithDetails(mockAssistantRow, [], {}, mockAssistantTags, mockMemoryFocusRuleRow);

    expect(result).toBeDefined();
    expect(result.focusedMemories).toHaveLength(0);
  });

  test('should handle empty assistant tags gracefully', () => {
    const result = transformAssistantWithDetails(mockAssistantRow, mockMemoryRows, mockMemoryTags, []);

    expect(result).toBeDefined();
    expect(result.assistantTags).toHaveLength(0);
  });
});
