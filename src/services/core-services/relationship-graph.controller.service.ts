import { Pool } from 'pg';
import { RelationshipGraph } from '../../models/relationship.model';
import { RelationshipGraphServiceModel } from '../../models/service-models/relationship-graph.service.model';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';

export class RelationshipGraphControllerService implements RelationshipGraphServiceModel {
  relationshipGraphService: RelationshipGraphService;

  constructor(pool: Pool) {
    this.relationshipGraphService = new RelationshipGraphService(pool);
  }

  async getAllRelationships(): Promise<RelationshipGraph[]> {
    return await this.relationshipGraphService.getAllRelationships();
  }

  async getRelationshipsBySource(sourceId: string): Promise<RelationshipGraph[]> {
    return await this.relationshipGraphService.getRelationshipsBySource(sourceId);
  }

  async getRelationshipsByTargetAndType(targetId: string, type: RelationshipGraph['type']): Promise<RelationshipGraph[]> {
    return await this.relationshipGraphService.getRelationshipsByTargetAndType(targetId, type);
  }

  async addRelationship(relationship: RelationshipGraph): Promise<boolean> {
    return await this.relationshipGraphService.addRelationship(relationship);
  }

  async updateRelationship(id: string, updates: RelationshipGraph): Promise<boolean> {
    return await this.relationshipGraphService.updateRelationship(id, updates);
  }

  async deleteRelationship(id: string): Promise<boolean> {
    return await this.relationshipGraphService.deleteRelationship(id);
  }
}
