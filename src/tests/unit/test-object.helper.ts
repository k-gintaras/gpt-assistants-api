import { AssistantWithDetails } from '../../models/assistant.model';

export const testFullAssistantObject: AssistantWithDetails = {
  id: '1',
  name: 'Test Assistant',
  description: 'A test assistant',
  type: 'chat',
  model: 'gpt-4o',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-02T10:00:00Z',
  assistantTags: [
    { id: 'tag1', name: 'Test Tag 1' },
    { id: 'tag2', name: 'Test Tag 2' },
  ],
  focusedMemories: [
    {
      id: 'memory1',
      type: 'knowledge',
      description: 'Test Memory Description',
      data: JSON.stringify({ key: 'value' }),
      createdAt: new Date('2025-01-01T11:00:00Z'),
      updatedAt: new Date('2025-01-02T11:00:00Z'),
      tags: [
        { id: 'memory-tag1', name: 'Memory Tag 1' },
        { id: 'memory-tag2', name: 'Memory Tag 2' },
      ],
      name: null,
      summary: null,
    },
  ],
  memoryFocusRule: {
    id: 'focus1',
    assistantId: '1',
    maxResults: 10,
    relationshipTypes: ['related_to'],
    priorityTags: ['priority1'],
    createdAt: new Date('2025-01-01T10:30:00Z'),
    updatedAt: new Date('2025-01-02T10:30:00Z'),
  },
  feedbackSummary: {
    avgRating: 5,
    totalFeedback: 2,
  },
};
