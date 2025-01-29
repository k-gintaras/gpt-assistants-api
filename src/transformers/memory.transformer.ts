import { MemoryRow, MemoryWithTags } from '../models/memory.model';
import { Tag } from '../models/tag.model';

export function transformMemoryRow(row: MemoryRow, tags: Tag[] = []): MemoryWithTags {
  return {
    id: row.id,
    type: row.type,
    description: row.description || null, // Use null for missing descriptions
    data: row.data ? row.data : null, // Parse JSON or return null
    createdAt: new Date(row.createdAt), // Ensure a valid Date object
    updatedAt: new Date(row.updatedAt), // Ensure a valid Date object
    tags: tags.length > 0 ? tags : null, // Include tags if provided, else null
  };
}
