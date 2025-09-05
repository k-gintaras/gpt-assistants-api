import { getDb } from '../test-db.helper';
import { RelationshipGraph } from '../../../models/relationship.model';
import { Pool } from 'pg';
import { RelationshipGraphService } from '../../../services/sqlite-services/relationship-graph.service';

describe('RelationshipGraphService', () => {
  let db: Pool;
  let service: RelationshipGraphService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    service = new RelationshipGraphService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query('BEGIN'); // Start transaction for each test
    // Clean up any existing relationships to ensure test isolation
    await db.query('DELETE FROM relationship_graph');
  });

  afterEach(async () => {
    await db.query('ROLLBACK'); // Rollback changes after each test
  });

  test('should add a relationship', async () => {
    const relationship = {
      id: 'test1_assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'test1_assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };

    const result = await service.addRelationship(relationship);
    expect(result).toBe(true);
  });

  test('should retrieve all relationships', async () => {
    const relationship1 = {
      id: 'test2_assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'test2_assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };
    const relationship2 = {
      id: 'test2_memory1Id',
      type: 'memory' as RelationshipGraph['type'],
      targetId: 'test2_memory2Id',
      relationshipType: 'related_to' as RelationshipGraph['relationshipType'],
    };

    await service.addRelationship(relationship1);
    await service.addRelationship(relationship2);

    const relationships = await service.getAllRelationships();
    expect(relationships.length).toBe(2);
  });

  test('should retrieve relationships by source ID', async () => {
    const relationship = {
      id: 'test3_assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'test3_assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const results = await service.getRelationshipsBySource('test3_assistant1Id');
    expect(results.length).toBe(1);
    expect(results[0].targetId).toBe('test3_assistant2Id');
  });

  test('should retrieve relationships by target ID', async () => {
    const relationship = {
      id: 'test4_memory1Id',
      type: 'memory' as RelationshipGraph['type'],
      targetId: 'test4_memory2Id',
      relationshipType: 'related_to' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const results = await service.getRelationshipsByTarget('test4_memory2Id');
    expect(results.length).toBe(1);
    expect(results[0].relationshipType).toBe('related_to');
  });

  test('should update a relationship', async () => {
    const relationship = {
      id: 'test5_assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'test5_assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const updates = { relationshipType: 'blocks' as RelationshipGraph['relationshipType'] };
    const result = await service.updateRelationship('test5_assistant1Id', updates);
    expect(result).toBe(true);

    const updated = await service.getRelationshipsByTarget('test5_assistant2Id');
    expect(updated[0].relationshipType).toBe('blocks');
  });

  test('should delete a relationship', async () => {
    const relationship = {
      id: 'test6_task1Id',
      type: 'task' as RelationshipGraph['type'],
      targetId: 'test6_task2Id',
      relationshipType: 'subtask_of' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const deleteResult = await service.deleteRelationship('test6_task1Id');
    expect(deleteResult).toBe(true);

    const relationships = await service.getAllRelationships();
    expect(relationships.length).toBe(0);
  });
});
