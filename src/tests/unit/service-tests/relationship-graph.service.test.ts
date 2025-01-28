import Database from 'better-sqlite3';
import { RelationshipGraph } from '../../../models/relationship.model';
import { RelationshipGraphService } from '../../../services/sqlite-services/relationship-graph.service';

let relationshipGraphService: RelationshipGraphService;
describe('Relationship Graph Service', () => {
  beforeAll(() => {
    const db = new Database(':memory:');
    // Initialize the relationship_graph table
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
    relationshipGraphService = new RelationshipGraphService(db);
  });

  afterAll(() => {
    relationshipGraphService.db.close();
  });

  it('should add a new relationship', async () => {
    const relationship: Omit<RelationshipGraph, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'task',
      targetId: 'memory1',
      relationshipType: 'depends_on',
    };

    const relationshipId = await relationshipGraphService.addRelationship(relationship);
    expect(relationshipId).toBeDefined();

    const allRelationships = relationshipGraphService.getAllRelationships();
    expect(allRelationships.length).toBe(1);
    expect(allRelationships[0]).toMatchObject({
      type: 'task',
      targetId: 'memory1',
      relationshipType: 'depends_on',
    });
  });

  it('should fetch relationships by source ID and type', async () => {
    const relationship: Omit<RelationshipGraph, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'assistant',
      targetId: 'task1',
      relationshipType: 'related_to',
    };

    const relationshipId = await relationshipGraphService.addRelationship(relationship);

    const relationships = relationshipGraphService.getRelationshipsBySource('task1', 'assistant');
    expect(relationships.length).toBe(1);
    expect(relationships[0].id).toBe(relationshipId);
    expect(relationships[0].type).toBe('assistant');
    expect(relationships[0].targetId).toBe('task1');
    expect(relationships[0].relationshipType).toBe('related_to');
  });

  it('should update an existing relationship', async () => {
    const relationship: Omit<RelationshipGraph, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'memory',
      targetId: 'assistant1',
      relationshipType: 'derived_from',
    };

    const relationshipId = await relationshipGraphService.addRelationship(relationship);

    const updated = await relationshipGraphService.updateRelationship(relationshipId, {
      relationshipType: 'part_of',
    });

    expect(updated).toBe(true);

    const allRelationships = relationshipGraphService.getAllRelationships();
    const updatedRelationship = allRelationships.find((rel) => rel.id === relationshipId);
    expect(updatedRelationship).toMatchObject({
      type: 'memory',
      targetId: 'assistant1',
      relationshipType: 'part_of',
    });
  });

  it('should delete a relationship', async () => {
    const relationship: Omit<RelationshipGraph, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'task',
      targetId: 'memory2',
      relationshipType: 'blocks',
    };

    const relationshipId = await relationshipGraphService.addRelationship(relationship);

    const deleted = await relationshipGraphService.deleteRelationship(relationshipId);
    expect(deleted).toBe(true);

    const allRelationships = relationshipGraphService.getAllRelationships();
    expect(allRelationships.find((rel) => rel.id === relationshipId)).toBeUndefined();
  });

  it('should return false when deleting a non-existent relationship', async () => {
    const deleted = await relationshipGraphService.deleteRelationship('nonexistent-id');
    expect(deleted).toBe(false);
  });

  it('should throw an error when updating a non-existent relationship', async () => {
    await expect(
      relationshipGraphService.updateRelationship('nonexistent-id', {
        relationshipType: 'related_to',
      })
    ).rejects.toThrow('Relationship with ID nonexistent-id not found.');
  });
});
