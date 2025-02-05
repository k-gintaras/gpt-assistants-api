import { Pool } from 'pg';
import { RelationshipType } from '../../models/service-models/orchestrator.service.model';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';
import { RelationshipGraph } from '../../models/relationship.model';

export class AssistantConnectionService {
  relationshipGraphService: RelationshipGraphService;

  constructor(pool: Pool) {
    this.relationshipGraphService = new RelationshipGraphService(pool);
  }

  async connectAssistants(primaryId: string, dependentId: string, relation: RelationshipType): Promise<boolean> {
    try {
      const existingRelation = await this.relationshipGraphService.getRelationshipsByTargetAndType(primaryId, 'assistant');
      if (existingRelation.some((rel) => rel.targetId === dependentId && rel.relationshipType === relation)) {
        return true; // ✅ Return true because it's already connected
      }
      const now = new Date();
      const g: RelationshipGraph = {
        id: primaryId,
        type: 'assistant',
        targetId: dependentId,
        relationshipType: relation,
        createdAt: now,
        updatedAt: now,
      };

      const relId = await this.relationshipGraphService.addRelationship(g);
      return relId !== null;
    } catch {
      return false;
    }
  }
}
