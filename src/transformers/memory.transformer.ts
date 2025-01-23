import { Memory, MemoryRow } from '../models/memory.model';
import { Tag } from '../models/tag.model';

export function transformMemoryRow(row: MemoryRow, tags: Tag[]): Memory {
  return {
    id: row.id,
    type: row.type,
    tags, // Relational tags
    description: row.description || null, // Use null instead of undefined
    data: row.data ? JSON.parse(row.data) : null, // Use null instead of undefined
    createdAt: new Date(row.createdAt), // Ensure a valid Date is created
    updatedAt: new Date(row.updatedAt), // Ensure a valid Date is created
  };
}
