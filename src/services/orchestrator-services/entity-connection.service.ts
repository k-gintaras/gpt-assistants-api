import { Pool } from 'pg';
import { RelationshipType } from '../../models/service-models/orchestrator.service.model';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';
import { RelationshipGraph } from '../../models/relationship.model';

export class EntityConnectionService {
  relationshipGraphService: RelationshipGraphService;

  constructor(pool: Pool) {
    this.relationshipGraphService = new RelationshipGraphService(pool);
  }

  async connectEntities(sourceType: 'assistant' | 'memory' | 'task', sourceId: string, targetType: 'assistant' | 'memory' | 'task', targetId: string, relation: RelationshipType): Promise<boolean> {
    try {
      const existingRelations = await this.relationshipGraphService.getRelationshipsBySource(sourceId);
      if (existingRelations.some((rel) => rel.targetId === targetId && rel.relationshipType === relation)) {
        return true; // ✅ Relationship exists, no need to add again
      }
      const now = new Date();
      const g: RelationshipGraph = {
        id: sourceId,
        type: sourceType,
        targetId: targetId,
        relationshipType: relation,
        createdAt: now,
        updatedAt: now,
      };
      return await this.relationshipGraphService.addRelationship(g);
    } catch {
      return false;
    }
  }
}
