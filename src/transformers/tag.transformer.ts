import { TagRow, Tag } from '../models/tag.model';

export function transformTagRow(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
  };
}
