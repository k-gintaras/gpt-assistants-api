import Database from 'better-sqlite3';
import { RelationshipGraph, RelationshipGraphRow } from '../../models/relationship.model';

export class RelationshipGraphService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Override database instance
  }

  // Fetch all relationships
  getAllRelationships(): RelationshipGraph[] {
    const stmt = this.db.prepare('SELECT * FROM relationship_graph');
    const results = stmt.all() as RelationshipGraphRow[];
    return results.map((row) => this.transformRow(row));
  }

  // Fetch relationships where a given assistant is the "source" (initiator)
  getRelationshipsBySource(sourceId: string): RelationshipGraph[] {
    const stmt = this.db.prepare(`
    SELECT * 
    FROM relationship_graph 
    WHERE id = ?
  `);
    const results = stmt.all(sourceId) as RelationshipGraphRow[];
    return results.map((row) => this.transformRow(row));
  }

  async getRelatedTopics(sourceId: string): Promise<string[]> {
    try {
      const relationships = this.db
        .prepare(
          `
      SELECT target_id 
      FROM relationship_graph 
      WHERE id = ?
    `
        )
        .all(sourceId) as { target_id: string }[];

      return relationships.map((rel) => rel.target_id);
    } catch (error) {
      console.error('Error in getRelatedTopics:', error);
      return [];
    }
  }

  // Fetch relationships where a given assistant is the "target" (being depended on)
  getRelationshipsByTarget(targetId: string): RelationshipGraph[] {
    const stmt = this.db.prepare(`
    SELECT * 
    FROM relationship_graph 
    WHERE target_id = ?
  `);
    const results = stmt.all(targetId) as RelationshipGraphRow[];
    return results.map((row) => this.transformRow(row));
  }

  // Fetch relationships by target ID and type
  getRelationshipsByTargetAndType(targetId: string, type: RelationshipGraph['type']): RelationshipGraph[] {
    const stmt = this.db.prepare(`
    SELECT * 
    FROM relationship_graph 
    WHERE target_id = ? AND type = ?
  `);
    const results = stmt.all(targetId, type) as RelationshipGraphRow[];
    return results.map((row) => this.transformRow(row));
  }

  // Add a new relationship
  async addRelationship(relationship: Omit<RelationshipGraph, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = this.db.prepare(`
    INSERT INTO relationship_graph (id, type, target_id, relationship_type, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const result = stmt.run(
      relationship.id,
      relationship.type, // Always "assistant"
      relationship.targetId, // The assistant it's related to
      relationship.relationshipType, // Relationship type
      createdAt,
      updatedAt
    );

    return result.changes > 0;
  }

  // Update an existing relationship
  async updateRelationship(id: string, updates: Partial<Omit<RelationshipGraph, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existing = this.db.prepare('SELECT * FROM relationship_graph WHERE id = ?').get(id);
    if (!existing) {
      throw new Error(`Relationship with ID ${id} not found.`);
    }

    const stmt = this.db.prepare(`
      UPDATE relationship_graph
      SET
        type = COALESCE(?, type),
        target_id = COALESCE(?, target_id),
        relationship_type = COALESCE(?, relationship_type),
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(updates.type || null, updates.targetId || null, updates.relationshipType || null, new Date().toISOString(), id);

    return true;
  }

  // Delete a relationship
  async deleteRelationship(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM relationship_graph
      WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0; // Returns true if the relationship was deleted
  }

  // Transform database row to RelationshipGraph object
  transformRow(row: RelationshipGraphRow): RelationshipGraph {
    return {
      id: row.id,
      type: row.type,
      targetId: row.target_id,
      relationshipType: row.relationship_type,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}
