import Database from 'better-sqlite3';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';
import { RelationshipType } from '../../models/service-models/orchestrator.service.model';

export class AssistantConnectionService {
  relationshipGraphService: RelationshipGraphService;

  constructor(db: Database.Database) {
    this.relationshipGraphService = new RelationshipGraphService(db);
  }

  /**
   * Connects two assistants with a specific relationship type.
   * Prevents duplicate relationships.
   * @param primaryId - The main assistant initiating the connection.
   * @param dependentId - The assistant being connected.
   * @param relation - The type of relationship (e.g., "depends_on", "related_to").
   * @returns {Promise<boolean>} Success status.
   */
  async connectAssistants(primaryId: string, dependentId: string, relation: RelationshipType): Promise<boolean> {
    try {
      // Check if relationship exists
      const existingRelation = await this.relationshipGraphService.getRelationshipsByTargetAndType(primaryId, 'assistant');
      if (existingRelation.some((rel) => rel.targetId === dependentId && rel.relationshipType === relation)) {
        // console.warn(`Relationship already exists: ${primaryId} -> ${dependentId} (${relation})`);
        return true; // ✅ Return true because it's already connected
      }

      // Add new relationship
      const relId = await this.relationshipGraphService.addRelationship({
        id: primaryId,
        type: 'assistant',
        targetId: dependentId,
        relationshipType: relation,
      });
      return relId !== null;
    } catch {
      // console.error('Error in connectAssistants:', error);
      return false;
    }
  }
}
