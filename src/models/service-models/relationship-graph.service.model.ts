import { RelationshipGraph } from '../../models/relationship.model';

export interface RelationshipGraphServiceModel {
  getAllRelationships(): Promise<RelationshipGraph[]>;
  getRelationshipsBySource(targetId: string): Promise<RelationshipGraph[]>;
  getRelationshipsByTargetAndType(targetId: string, type: RelationshipGraph['type']): Promise<RelationshipGraph[]>;
  addRelationship(relationship: RelationshipGraph): Promise<boolean>;
  updateRelationship(id: string, updates: RelationshipGraph): Promise<boolean>;
  deleteRelationship(id: string): Promise<boolean>;
}
