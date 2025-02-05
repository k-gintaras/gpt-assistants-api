export interface OwnedMemory {
  assistantId: string; // Assistant owning the memory
  memoryId: string; // Memory ID
}

export interface FocusedMemory {
  memoryFocusId: string; // ID of the memory focus rule
  memoryId: string; // Memory ID
}

export interface MemoryFocusRule {
  id: string;
  assistantId: string;
  maxResults: number;
  relationshipTypes: string[]; // Parsed JSON array
  priorityTags: string[]; // Parsed JSON array
  createdAt: Date;
  updatedAt: Date;
}
export interface OwnedMemoryRow {
  assistant_id: string; // Assistant owning the memory
  memory_id: string; // Memory ID
}

export interface FocusedMemoryRow {
  memory_focus_id: string; // ID of the memory focus rule
  memory_id: string; // Memory ID
}

export interface MemoryFocusRuleRow {
  id: string; // Unique identifier for the focus rule
  assistant_id: string; // Associated assistant
  max_results: number; // Maximum number of memories
  relationship_types: string[] | null; // Serialized JSON
  priority_tags: string[] | null; // Serialized JSON
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
