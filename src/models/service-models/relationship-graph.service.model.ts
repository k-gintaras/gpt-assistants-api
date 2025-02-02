import { RelationshipGraph } from '../../models/relationship.model';

export interface RelationshipGraphServiceModel {
  getAllRelationships(): RelationshipGraph[];
  getRelationshipsBySource(targetId: string): RelationshipGraph[];
  getRelationshipsByTargetAndType(targetId: string, type: RelationshipGraph['type']): RelationshipGraph[];
  addRelationship(relationship: RelationshipGraph): Promise<boolean>;
  updateRelationship(id: string, updates: RelationshipGraph): Promise<boolean>;
  deleteRelationship(id: string): Promise<boolean>;
}
