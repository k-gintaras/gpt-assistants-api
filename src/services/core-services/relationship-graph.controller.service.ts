import Database from 'better-sqlite3';
import { RelationshipGraph } from '../../models/relationship.model';
import { RelationshipGraphServiceModel } from '../../models/service-models/relationship-graph.service.model';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';

export class RelationshipGraphControllerService implements RelationshipGraphServiceModel {
  relationshipGraphService: RelationshipGraphService;

  constructor(db: Database.Database) {
    this.relationshipGraphService = new RelationshipGraphService(db);
  }

  getAllRelationships(): RelationshipGraph[] {
    return this.relationshipGraphService.getAllRelationships();
  }

  getRelationshipsBySource(targetId: string): RelationshipGraph[] {
    return this.relationshipGraphService.getRelationshipsBySource(targetId);
  }

  getRelationshipsByTargetAndType(targetId: string, type: RelationshipGraph['type']): RelationshipGraph[] {
    return this.relationshipGraphService.getRelationshipsByTargetAndType(targetId, type);
  }

  addRelationship(relationship: RelationshipGraph): Promise<boolean> {
    return this.relationshipGraphService.addRelationship(relationship);
  }

  updateRelationship(id: string, updates: RelationshipGraph): Promise<boolean> {
    return this.relationshipGraphService.updateRelationship(id, updates);
  }

  deleteRelationship(id: string): Promise<boolean> {
    return this.relationshipGraphService.deleteRelationship(id);
  }
}
