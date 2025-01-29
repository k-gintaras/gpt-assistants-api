import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { RelationshipGraphControllerService } from '../services/core-services/relationship-graph.controller.service';
import { RelationshipGraph } from '../models/relationship.model';
import { respond } from './controller.helper';

export class RelationshipGraphController {
  private readonly relationshipGraphService: RelationshipGraphControllerService;

  constructor(db: Database.Database) {
    this.relationshipGraphService = new RelationshipGraphControllerService(db);
  }

  async getAllRelationships(_req: Request, res: Response) {
    try {
      const relationships = await this.relationshipGraphService.getAllRelationships();
      if (!relationships || relationships.length === 0) {
        return respond(res, 404, 'No relationships found.');
      }
      return respond(res, 200, 'Relationships fetched successfully', relationships);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve relationships.', null, error);
    }
  }

  async getRelationshipsBySource(req: Request, res: Response) {
    const { targetId } = req.params;
    try {
      const relationships = await this.relationshipGraphService.getRelationshipsBySource(targetId);
      if (!relationships || relationships.length === 0) {
        return respond(res, 404, `No relationships found for target ID ${targetId}.`);
      }
      return respond(res, 200, `Relationships for target ID ${targetId} fetched successfully`, relationships);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve relationships.', null, error);
    }
  }

  async getRelationshipsBySourceAndType(req: Request, res: Response) {
    const { targetId } = req.params;
    const { relationshipType } = req.params;

    try {
      const relationships = await this.relationshipGraphService.getRelationshipsBySourceAndType(targetId, relationshipType as RelationshipGraph['type']);
      if (!relationships || relationships.length === 0) {
        return respond(res, 404, `No relationships found for target ID ${targetId}.`);
      }
      return respond(res, 200, `Relationships for target ID ${targetId} fetched successfully`, relationships);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve relationships.', null, error);
    }
  }

  async addRelationship(req: Request, res: Response) {
    const relationship: RelationshipGraph = req.body;
    try {
      const relationshipId = await this.relationshipGraphService.addRelationship(relationship);
      return respond(res, 201, 'Relationship created successfully.', { id: relationshipId });
    } catch (error) {
      return respond(res, 500, 'Failed to create relationship.', null, error);
    }
  }

  async updateRelationship(req: Request, res: Response) {
    const { id } = req.params;
    const updates: RelationshipGraph = req.body;
    try {
      const isUpdated = await this.relationshipGraphService.updateRelationship(id, updates);
      if (!isUpdated) {
        return respond(res, 404, `Relationship with ID ${id} not found or update failed.`);
      }
      return respond(res, 200, 'Relationship updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update relationship.', null, error);
    }
  }

  async deleteRelationship(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const isDeleted = await this.relationshipGraphService.deleteRelationship(id);
      if (!isDeleted) {
        return respond(res, 404, `Relationship with ID ${id} not found or delete failed.`);
      }
      return respond(res, 200, 'Relationship deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete relationship.', null, error);
    }
  }
}
