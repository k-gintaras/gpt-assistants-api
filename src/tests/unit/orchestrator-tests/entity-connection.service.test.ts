/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import { RelationshipType } from '../../../models/service-models/orchestrator.service.model';
import { EntityConnectionService } from '../../../services/orchestrator-services/entity-connection.service';
import { getDb } from '../test-db.helper';

describe('EntityConnectionService', () => {
  let db: Pool;
  let entityConnectionService: EntityConnectionService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    entityConnectionService = new EntityConnectionService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query(`BEGIN`);
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  test('connectEntities adds new relationship when none exists', async () => {
    const sourceType: 'assistant' | 'memory' | 'task' = 'assistant';
    const sourceId = 'assistantA';
    const targetType: 'assistant' | 'memory' | 'task' = 'assistant';
    const targetId = 'assistantB';
    const relation: RelationshipType = 'depends_on';

    const result: any = await entityConnectionService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
    expect(result).toBe(true);

    const row: any = await db.query(`SELECT * FROM relationship_graph WHERE id = $1`, [sourceId]);
    expect(row.rows.length).toBe(1);
    expect(row.rows[0].target_id).toBe(targetId);
    expect(row.rows[0].relationship_type).toBe(relation);
    expect(row.rows[0].type).toBe(sourceType);
  });

  test('connectEntities returns true if relationship already exists', async () => {
    const sourceType: 'assistant' | 'memory' | 'task' = 'assistant';
    const sourceId = 'assistantA';
    const targetType: 'assistant' | 'memory' | 'task' = 'assistant';
    const targetId = 'assistantB';
    const relation: RelationshipType = 'related_to';

    (entityConnectionService.relationshipGraphService.getRelationshipsBySource as any) = async (srcId: string): Promise<any[]> => {
      return [{ targetId, relationshipType: relation }];
    };

    const result: any = await entityConnectionService.connectEntities(sourceType, sourceId, targetType, targetId, relation);
    expect(result).toBe(true);
  });

  test('connectEntities returns false on error', async () => {
    (entityConnectionService.relationshipGraphService.getRelationshipsBySource as any) = async (): Promise<any[]> => {
      throw new Error('Test error');
    };

    const result: any = await entityConnectionService.connectEntities('assistant', 'assistantA', 'assistant', 'assistantB', 'blocks');
    expect(result).toBe(false);
  });
});
