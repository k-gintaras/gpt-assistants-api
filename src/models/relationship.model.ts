export interface RelationshipGraph {
  id: string; // Unique identifier for the graph node
  type: 'assistant' | 'memory' | 'task'; // Type of the node
  targetIds: string[]; // Related node IDs
  relationships: Relationship[]; // Connections between nodes
}

export interface Relationship {
  type: 'related_to' | 'depends_on' | 'inherits_from' | 'example_of'; // Relationship type
  targetId: string; // ID of the related node
}
