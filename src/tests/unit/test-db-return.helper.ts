import { FullAssistantRows } from '../../transformers/assistant-full.transformer';

export const testFullAssistantRows: FullAssistantRows[] = [
  {
    assistant_id: '1',
    assistant_name: 'Test Assistant',
    assistant_description: 'A test assistant',
    assistant_type: 'chat',
    assistant_model: 'gpt-4o',
    avg_rating: 5,
    total_feedback: 2,
    assistant_createdAt: '2025-01-01T10:00:00Z',
    assistant_updatedAt: '2025-01-02T10:00:00Z',
    assistant_tag_id: 'tag1',
    assistant_tag_name: 'Test Tag 1',
    focus_rule_id: 'focus1',
    focus_rule_maxResults: 10,
    focus_rule_relationshipTypes: '["related_to"]',
    focus_rule_priorityTags: '["priority1"]',
    focus_rule_createdAt: '2025-01-01T10:30:00Z',
    focus_rule_updatedAt: '2025-01-02T10:30:00Z',
    memory_id: 'memory1',
    memory_type: 'knowledge',
    memory_description: 'Test Memory Description',
    memory_data: '{"key":"value"}',
    memory_createdAt: '2025-01-01T11:00:00Z',
    memory_updatedAt: '2025-01-02T11:00:00Z',
    memory_tag_id: 'memory-tag1',
    memory_tag_name: 'Memory Tag 1',
  },
  {
    assistant_id: '1',
    assistant_name: 'Test Assistant',
    assistant_description: 'A test assistant',
    assistant_type: 'chat',
    assistant_model: 'gpt-4o',
    avg_rating: 5,
    total_feedback: 2,
    assistant_createdAt: '2025-01-01T10:00:00Z',
    assistant_updatedAt: '2025-01-02T10:00:00Z',
    assistant_tag_id: 'tag2',
    assistant_tag_name: 'Test Tag 2',
    focus_rule_id: 'focus1',
    focus_rule_maxResults: 10,
    focus_rule_relationshipTypes: '["related_to"]',
    focus_rule_priorityTags: '["priority1"]',
    focus_rule_createdAt: '2025-01-01T10:30:00Z',
    focus_rule_updatedAt: '2025-01-02T10:30:00Z',
    memory_id: 'memory1',
    memory_type: 'knowledge',
    memory_description: 'Test Memory Description',
    memory_data: '{"key": "value"}',
    memory_createdAt: '2025-01-01T11:00:00Z',
    memory_updatedAt: '2025-01-02T11:00:00Z',
    memory_tag_id: 'memory-tag2',
    memory_tag_name: 'Memory Tag 2',
  },
];
