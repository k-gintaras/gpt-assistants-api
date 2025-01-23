import { Tag } from './tag.model';

export interface Memory {
  id: string;
  type: 'instruction' | 'session' | 'prompt' | 'knowledge' | 'meta';
  tags: Tag[];
  description: string | null; // Nullable in the database
  data: Record<string, unknown> | null; // Nullable in the database
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MemoryRow {
  id: string;
  type: 'instruction' | 'session' | 'prompt' | 'knowledge' | 'meta';
  description: string | null;
  data: string | null; // Serialized JSON in the database
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}
