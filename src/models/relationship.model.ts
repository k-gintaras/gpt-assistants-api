export interface RelationshipGraph {
  id: string; // Unique identifier for the relationship
  type: 'assistant' | 'memory' | 'task'; // Type of the source entity
  targetId: string; // ID of the related entity
  relationshipType: 'related_to' | 'part_of' | 'example_of' | 'derived_from' | 'depends_on' | 'blocks' | 'subtask_of'; // Type of relationship
  createdAt: Date; // Relationship creation timestamp
  updatedAt: Date; // Last update timestamp
}
export interface RelationshipGraphRow {
  id: string; // Unique identifier for the relationship
  type: 'assistant' | 'memory' | 'task'; // Type of the source entity
  target_id: string; // ID of the related entity
  relationship_type: 'related_to' | 'part_of' | 'example_of' | 'derived_from' | 'depends_on' | 'blocks' | 'subtask_of'; // Type of relationship
  created_at: Date; // Relationship creation timestamp
  updated_at: Date; // Last update timestamp
}
