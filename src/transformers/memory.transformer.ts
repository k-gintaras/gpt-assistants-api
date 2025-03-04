import { Memory, MemoryRow, MemoryWithTags } from '../models/memory.model';
import { Tag } from '../models/tag.model';

export function transformMemoryRow(row: MemoryRow, tags: Tag[] = []): MemoryWithTags {
  return {
    id: row.id,
    name: row.name || null, // Ensure name is included
    summary: row.summary || null, // Ensure summary is included
    type: row.type,
    description: row.description || null, // Use null for missing descriptions
    data: row.data ? row.data : null, // Parse JSON or return null
    createdAt: new Date(row.created_at), // Ensure a valid Date object
    updatedAt: new Date(row.updated_at), // Ensure a valid Date object
    tags: tags.length > 0 ? tags : null, // Include tags if provided, else null
  };
}

export function transformBasicMemoryRow(row: MemoryRow): Memory {
  return {
    id: row.id,
    name: row.name || null,
    summary: row.summary || null,
    type: row.type,
    description: row.description || null,
    data: row.data ? row.data : null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}
