import { MemoryRow } from '../../../models/memory.model';
import { Tag } from '../../../models/tag.model';
import { transformMemoryRow } from '../../../transformers/memory.transformer';

describe('transformMemoryRow', () => {
  const tags: Tag[] = [
    { id: 'tag1', name: 'Tag 1' },
    { id: 'tag2', name: 'Tag 2' },
  ];

  it('transforms a valid MemoryRow into a Memory object', () => {
    const row: MemoryRow = {
      id: 'memory1',
      type: 'instruction',
      description: 'Test description',
      data: '{"key":"value"}',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    };

    const result = transformMemoryRow(row, tags);

    expect(result).toEqual({
      id: 'memory1',
      type: 'instruction',
      tags,
      description: 'Test description',
      data: '{"key":"value"}',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
    });
  });

  it('handles null description and data gracefully', () => {
    const row: MemoryRow = {
      id: 'memory2',
      type: 'session',
      description: null,
      data: null,
      created_at: '2025-01-03T00:00:00Z',
      updated_at: '2025-01-04T00:00:00Z',
    };

    const result = transformMemoryRow(row, tags);

    expect(result).toEqual({
      id: 'memory2',
      type: 'session',
      tags,
      description: null,
      data: null,
      createdAt: new Date('2025-01-03T00:00:00Z'),
      updatedAt: new Date('2025-01-04T00:00:00Z'),
    });
  });
});
