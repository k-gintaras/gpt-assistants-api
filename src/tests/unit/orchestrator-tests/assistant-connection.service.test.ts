/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import { RelationshipType } from '../../../models/service-models/orchestrator.service.model';
import { AssistantConnectionService } from '../../../services/orchestrator-services/assistant-connection.service';
import { getDb } from '../test-db.helper';

describe('AssistantConnectionService', () => {
  let db: Pool;
  let assistantConnectionService: AssistantConnectionService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    assistantConnectionService = new AssistantConnectionService(db);
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

  test('connectAssistants adds new relationship when none exists', async () => {
    const primaryId: string = 'assistantA';
    const dependentId: string = 'assistantB';
    const relation: RelationshipType = 'depends_on';

    const result: any = await assistantConnectionService.connectAssistants(primaryId, dependentId, relation);
    expect(result).toBe(true);

    const res: any = await db.query(`SELECT * FROM relationship_graph WHERE id = $1`, [primaryId]);
    const row = res.rows[0];
    expect(row).toBeDefined();
    expect(row.target_id).toBe(dependentId);
    expect(row.relationship_type).toBe(relation);
  });

  test('connectAssistants returns true if relationship already exists', async () => {
    const primaryId: string = 'assistantA';
    const dependentId: string = 'assistantB';
    const relation: RelationshipType = 'related_to';

    (assistantConnectionService.relationshipGraphService.getRelationshipsByTargetAndType as any) = async (pId: string, type: string) => {
      return [{ targetId: dependentId, relationshipType: relation }];
    };

    const result: any = await assistantConnectionService.connectAssistants(primaryId, dependentId, relation);
    expect(result).toBe(true);
  });

  test('connectAssistants returns false on error', async () => {
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
