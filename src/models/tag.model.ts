export interface TagRow {
  id: string; // Unique tag ID
  name: string; // Tag name
}
export interface Tag {
  id: string; // Unique tag ID
  name: string; // Tag name
}
export interface MemoryTagRow {
  memory_id: string; // ID of the memory
  tag_id: string; // ID of the tag
}
export interface AssistantTagRow {
  assistant_id: string; // ID of the assistant
  tag_id: string; // ID of the tag
}
