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
  });

  afterEach(async () => {
    await db.query('ROLLBACK'); // Rollback changes after each test
  });

  test('should add a relationship', async () => {
    const relationship = {
      id: 'assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };

    const result = await service.addRelationship(relationship);
    expect(result).toBe(true);
  });

  test('should retrieve all relationships', async () => {
    const relationship1 = {
      id: 'assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };
    const relationship2 = {
      id: 'memory1Id',
      type: 'memory' as RelationshipGraph['type'],
      targetId: 'memory2Id',
      relationshipType: 'related_to' as RelationshipGraph['relationshipType'],
    };

    await service.addRelationship(relationship1);
    await service.addRelationship(relationship2);

    const relationships = await service.getAllRelationships();
    expect(relationships.length).toBe(2);
  });

  test('should retrieve relationships by source ID', async () => {
    const relationship = {
      id: 'assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const results = await service.getRelationshipsBySource('assistant1Id');
    expect(results.length).toBe(1);
    expect(results[0].targetId).toBe('assistant2Id');
  });

  test('should retrieve relationships by target ID', async () => {
    const relationship = {
      id: 'memory1Id',
      type: 'memory' as RelationshipGraph['type'],
      targetId: 'memory2Id',
      relationshipType: 'related_to' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const results = await service.getRelationshipsByTarget('memory2Id');
    expect(results.length).toBe(1);
    expect(results[0].relationshipType).toBe('related_to');
  });

  test('should update a relationship', async () => {
    const relationship = {
      id: 'assistant1Id',
      type: 'assistant' as RelationshipGraph['type'],
      targetId: 'assistant2Id',
      relationshipType: 'depends_on' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const updates = { relationshipType: 'blocks' as RelationshipGraph['relationshipType'] };
    const result = await service.updateRelationship('assistant1Id', updates);
    expect(result).toBe(true);

    const updated = await service.getRelationshipsByTarget('assistant2Id');
    expect(updated[0].relationshipType).toBe('blocks');
  });

  test('should delete a relationship', async () => {
    const relationship = {
      id: 'task1Id',
      type: 'task' as RelationshipGraph['type'],
      targetId: 'task2Id',
      relationshipType: 'subtask_of' as RelationshipGraph['relationshipType'],
    };
    await service.addRelationship(relationship);

    const deleteResult = await service.deleteRelationship('task1Id');
    expect(deleteResult).toBe(true);

    const relationships = await service.getAllRelationships();
    expect(relationships.length).toBe(0);
  });
});
