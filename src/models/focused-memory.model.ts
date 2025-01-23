export interface OwnedMemoryRow {
  assistant_id: string; // Assistant owning the memory
  memory_id: string; // Memory ID
}

export interface OwnedMemory {
  assistantId: string; // Assistant owning the memory
  memoryId: string; // Memory ID
}

export interface FocusedMemoryRow {
  memory_focus_id: string; // ID of the memory focus rule
  memory_id: string; // Memory ID
}

export interface FocusedMemory {
  memoryFocusId: string; // ID of the memory focus rule
  memoryId: string; // Memory ID
}

export interface MemoryFocusRuleRow {
  id: string; // Unique identifier for the focus rule
  assistant_id: string; // Associated assistant
  maxResults: number; // Maximum number of memories
  relationshipTypes: string | null; // Serialized JSON
  priorityTags: string | null; // Serialized JSON
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
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
