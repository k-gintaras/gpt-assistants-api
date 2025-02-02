/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Database from 'better-sqlite3';
import { RelationshipType } from '../../../models/service-models/orchestrator.service.model';
import { AssistantConnectionService } from '../../../services/orchestrator-services/assistant-connection.service';

describe('AssistantConnectionService', () => {
  let db: Database.Database;
  let assistantConnectionService: AssistantConnectionService;

  beforeEach(() => {
    db = new Database(':memory:');
    // Create minimal schema for relationship_graph
    db.exec(`
      CREATE TABLE relationship_graph (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    assistantConnectionService = new AssistantConnectionService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('connectAssistants adds new relationship when none exists', async () => {
    const primaryId: string = 'assistantA';
    const dependentId: string = 'assistantB';
    const relation: RelationshipType = 'depends_on';

    // No relationship exists, so a new one should be added.
    const result: any = await assistantConnectionService.connectAssistants(primaryId, dependentId, relation);
    expect(result).toBe(true);

    // Verify that a new row was inserted in relationship_graph.
    const row: any = db.prepare(`SELECT * FROM relationship_graph WHERE id = ?`).get(primaryId);
    expect(row).toBeDefined();
    expect(row.target_id).toBe(dependentId);
    expect(row.relationship_type).toBe(relation);
  });

  test('connectAssistants returns true if relationship already exists', async () => {
    const primaryId: string = 'assistantA';
    const dependentId: string = 'assistantB';
    const relation: RelationshipType = 'related_to';

    // Override getRelationshipsByTargetAndType to simulate an existing relationship.
    (assistantConnectionService.relationshipGraphService.getRelationshipsByTargetAndType as any) = async (pId: string, type: string) => {
      return [{ targetId: dependentId, relationshipType: relation }];
    };

    const result: any = await assistantConnectionService.connectAssistants(primaryId, dependentId, relation);
    expect(result).toBe(true);
  });

  test('connectAssistants returns false on error', async () => {
    // Simulate an error by overriding getRelationshipsByTargetAndType to throw.
    (assistantConnectionService.relationshipGraphService.getRelationshipsByTargetAndType as any) = async (): Promise<any[]> => {
      throw new Error('Test error');
    };

    const primaryId: string = 'assistantA';
    const dependentId: string = 'assistantB';
    const relation: RelationshipType = 'blocks';

    const result: any = await assistantConnectionService.connectAssistants(primaryId, dependentId, relation);
    expect(result).toBe(false);
  });
});
