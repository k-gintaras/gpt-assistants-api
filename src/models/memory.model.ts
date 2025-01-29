import { Tag } from './tag.model';

// for not we using description as a memory... because our tests test for it... we will have to edit
// prompt service also uses description to create instructions
export interface Memory {
  id: string;
  type: 'instruction' | 'session' | 'prompt' | 'knowledge' | 'meta';
  description: string | null; // Nullable in the database
  data: string | null; // Nullable in the database
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MemoryWithTags extends Memory {
  tags: Tag[] | null;
}

export interface MemoryRow {
  id: string;
  type: 'instruction' | 'session' | 'prompt' | 'knowledge' | 'meta';
  description: string | null;
  data: string | null; // Serialized JSON in the database
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface MemoryRelationship {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  relationshipType: 'related_to' | 'part_of' | 'example_of' | 'derived_from';
  createdAt: string; // ISO 8601 date
  updatedAt: string; // ISO 8601 date
}
