import { Pool } from 'pg';
import { RelationshipGraph, RelationshipGraphRow } from '../../models/relationship.model';

export class RelationshipGraphService {
  constructor(private pool: Pool) {}

  getAllRelationships(): Promise<RelationshipGraph[]> {
    return this.pool.query<RelationshipGraphRow>('SELECT * FROM relationship_graph').then((results) => results.rows.map((row) => this.transformRow(row)));
  }

  getRelationshipsBySource(sourceId: string): Promise<RelationshipGraph[]> {
    return this.pool.query<RelationshipGraphRow>('SELECT * FROM relationship_graph WHERE id = $1', [sourceId]).then((results) => results.rows.map((row) => this.transformRow(row)));
  }

  async getRelatedTopics(sourceId: string): Promise<string[]> {
    try {
      const relationships = await this.pool.query<{ target_id: string }>('SELECT target_id FROM relationship_graph WHERE id = $1', [sourceId]);
      return relationships.rows.map((rel) => rel.target_id);
    } catch (error) {
      console.error('Error in getRelatedTopics:', error);
      return [];
    }
  }

  getRelationshipsByTarget(targetId: string): Promise<RelationshipGraph[]> {
    return this.pool.query<RelationshipGraphRow>('SELECT * FROM relationship_graph WHERE target_id = $1', [targetId]).then((results) => results.rows.map((row) => this.transformRow(row)));
  }

  getRelationshipsByTargetAndType(targetId: string, type: RelationshipGraph['type']): Promise<RelationshipGraph[]> {
    return this.pool
      .query<RelationshipGraphRow>('SELECT * FROM relationship_graph WHERE target_id = $1 AND type = $2', [targetId, type])
      .then((results) => results.rows.map((row) => this.transformRow(row)));
  }

  async addRelationship(relationship: Omit<RelationshipGraph, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = `
      INSERT INTO relationship_graph (id, type, target_id, relationship_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const result = await this.pool.query(stmt, [relationship.id, relationship.type, relationship.targetId, relationship.relationshipType, createdAt, updatedAt]);
    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Simplified return
  }

  async updateRelationship(id: string, updates: Partial<Omit<RelationshipGraph, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existing = await this.pool.query<RelationshipGraphRow>('SELECT * FROM relationship_graph WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      throw new Error(`Relationship with ID ${id} not found.`);
    }

    const stmt = `
      UPDATE relationship_graph
      SET
        type = COALESCE($1, type),
        target_id = COALESCE($2, target_id),
        relationship_type = COALESCE($3, relationship_type),
        updated_at = $4
      WHERE id = $5
    `;

    await this.pool.query(stmt, [updates.type || null, updates.targetId || null, updates.relationshipType || null, new Date().toISOString(), id]);

    return true;
  }

  async deleteRelationship(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM relationship_graph WHERE id = $1', [id]);
    if (!result?.rowCount) return false;

    return result.rowCount > 0; // Simplified return
  }

  transformRow(row: RelationshipGraphRow): RelationshipGraph {
    return {
      id: row.id,
      type: row.type,
      targetId: row.target_id,
      relationshipType: row.relationship_type,
      createdAt: new Date(row.created_at), // Updated to snake_case
      updatedAt: new Date(row.updated_at), // Updated to snake_case
    };
  }
}
