/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Database from 'better-sqlite3';
import { RelationshipType } from '../../../models/service-models/orchestrator.service.model';
import { EntityConnectionService } from '../../../services/orchestrator-services/entity-connection.service';

describe('EntityConnectionService', () => {
  let db: Database.Database;
  let entityConnectionService: EntityConnectionService;

  beforeEach(() => {
    db = new Database(':memory:');
    // Create a minimal relationship_graph table
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
    entityConnectionService = new EntityConnectionService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('connectEntities adds new relationship when none exists', async () => {
    const sourceType: 'assistant' | 'memory' | 'task' = 'assistant';
    const sourceId = 'assistantA';
    const targetType: 'assistant' | 'memory' | 'task' = 'assistant';
    const targetId = 'assistantB';
    const relation: RelationshipType = 'depends_on';

    // No relationship exists, so it should add one.
    const result: any = await entityConnectionService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
    expect(result).toBe(true);

    // Verify that the relationship was added.
    const row: any = db.prepare(`SELECT * FROM relationship_graph WHERE id = ?`).get(sourceId);
    expect(row).toBeDefined();
    expect(row.target_id).toBe(targetId);
    expect(row.relationship_type).toBe(relation);
    expect(row.type).toBe(sourceType);
  });

  test('connectEntities returns true if relationship already exists', async () => {
    const sourceType: 'assistant' | 'memory' | 'task' = 'assistant';
    const sourceId = 'assistantA';
    const targetType: 'assistant' | 'memory' | 'task' = 'assistant';
    const targetId = 'assistantB';
    const relation: RelationshipType = 'related_to';

    // Override getRelationshipsBySource to simulate an existing connection.
    (entityConnectionService.relationshipGraphService.getRelationshipsBySource as any) = async (srcId: string): Promise<any[]> => {
      return [{ targetId, relationshipType: relation }];
    };

    const result: any = await entityConnectionService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
    expect(result).toBe(true);
  });

  test('connectEntities returns false on error', async () => {
    // Simulate an error by overriding getRelationshipsBySource to throw.
    (entityConnectionService.relationshipGraphService.getRelationshipsBySource as any) = async (): Promise<any[]> => {
      throw new Error('Test error');
    };

    const result: any = await entityConnectionService.connectEntities('assistant', 'assistantA', 'assistant', 'assistantB', 'blocks');
    expect(result).toBe(false);
  });
});
