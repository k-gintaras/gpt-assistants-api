import Database from 'better-sqlite3';
import { RelationshipGraphService } from '../../../services/sqlite-services/relationship-graph.service';
import { RelationshipGraph } from '../../../models/relationship.model';

describe('RelationshipGraphService', () => {
  let db: Database.Database;
  let service: RelationshipGraphService;

  beforeAll(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS relationship_graph (
        id TEXT PRIMARY KEY,
        type TEXT CHECK(type IN ('assistant', 'memory', 'task')) NOT NULL,
        target_id TEXT NOT NULL,
        relationship_type TEXT CHECK(relationship_type IN ('related_to', 'part_of', 'example_of', 'derived_from', 'depends_on', 'blocks', 'subtask_of')) NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    service = new RelationshipGraphService(db);
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM relationship_graph');
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

    const relationships = service.getAllRelationships();
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

    const results = service.getRelationshipsBySource('assistant1Id');
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

    const results = service.getRelationshipsByTarget('memory2Id');
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

    const updated = service.getRelationshipsByTarget('assistant2Id');
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

    const relationships = service.getAllRelationships();
    expect(relationships.length).toBe(0);
  });
});
