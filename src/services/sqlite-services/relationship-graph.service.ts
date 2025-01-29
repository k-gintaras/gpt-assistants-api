import Database from 'better-sqlite3';
import { generateUniqueId } from './unique-id.service';
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

  // Fetch relationships by source ID and type
  getRelationshipsBySourceAndType(targetId: string, type: RelationshipGraph['type']): RelationshipGraph[] {
    const stmt = this.db.prepare(`
    SELECT * 
    FROM relationship_graph 
    WHERE target_id = ? AND type = ?
  `);
    const results = stmt.all(targetId, type) as RelationshipGraphRow[];
    return results.map((row) => this.transformRow(row));
  }

  // Fetch relationships by source ID and type
  getRelationshipsBySource(targetId: string): RelationshipGraph[] {
    const stmt = this.db.prepare(`
    SELECT * 
    FROM relationship_graph 
    WHERE target_id = ?
  `);
    const results = stmt.all(targetId) as RelationshipGraphRow[];
    return results.map((row) => this.transformRow(row));
  }

  // Add a new relationship
  async addRelationship(relationship: Omit<RelationshipGraph, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = this.db.prepare(`
      INSERT INTO relationship_graph (id, type, target_id, relationship_type, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, relationship.type, relationship.targetId, relationship.relationshipType, createdAt, updatedAt);

    return id;
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
