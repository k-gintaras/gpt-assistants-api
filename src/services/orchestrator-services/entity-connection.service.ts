import Database from 'better-sqlite3';
import { RelationshipType } from '../../models/service-models/orchestrator.service.model';
import { RelationshipGraphService } from '../sqlite-services/relationship-graph.service';

export class EntityConnectionService {
  relationshipGraphService: RelationshipGraphService;

  constructor(db: Database.Database) {
    this.relationshipGraphService = new RelationshipGraphService(db);
  }

  /**
   * Connects two entities (assistant, memory, task) with a relationship type.
   * Prevents duplicate connections.
   * @param sourceType - Type of the source entity ('assistant', 'memory', 'task')
   * @param sourceId - ID of the source entity
   * @param targetType - Type of the target entity ('assistant', 'memory', 'task')
   * @param targetId - ID of the target entity
   * @param relation - The relationship type (e.g., "depends_on", "related_to")
   * @returns {Promise<boolean>} Success status
   */
  async connectEntities(sourceType: 'assistant' | 'memory' | 'task', sourceId: string, targetType: 'assistant' | 'memory' | 'task', targetId: string, relation: RelationshipType): Promise<boolean> {
    try {
      // Ensure relationship doesn't already exist
      const existingRelations = await this.relationshipGraphService.getRelationshipsBySource(sourceId);
      if (existingRelations.some((rel) => rel.targetId === targetId && rel.relationshipType === relation)) {
        return true; // ✅ Relationship exists, no need to add again
      }

      // Add relationship
      return await this.relationshipGraphService.addRelationship({
        id: sourceId,
        type: sourceType,
        targetId,
        relationshipType: relation,
      });
    } catch {
      return false;
    }
  }
}
