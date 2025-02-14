import { Pool } from 'pg';
import { Request, Response } from 'express';
import { RelationshipGraphControllerService } from '../services/core-services/relationship-graph.controller.service';
import { RelationshipGraph } from '../models/relationship.model';
import { respond } from './controller.helper';

export class RelationshipGraphController {
  private readonly relationshipGraphService: RelationshipGraphControllerService;

  constructor(db: Pool) {
    this.relationshipGraphService = new RelationshipGraphControllerService(db);
  }

  /**
   * Retrieve all relationships.
   * @response {200} { status: "success", message: "Relationships fetched successfully", data: RelationshipGraph[] }
   * @response {404} { status: "error", message: "No relationships found." }
   * @response {500} { status: "error", message: "Failed to retrieve relationships.", error: any }
   */
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

  /**
   * Retrieve relationships by source (target ID).
   * @requestParams { targetId: string } The ID of the source.
   * @response {200} { status: "success", message: "Relationships for target ID {targetId} fetched successfully", data: RelationshipGraph[] }
   * @response {404} { status: "error", message: "No relationships found for target ID {targetId}." }
   * @response {500} { status: "error", message: "Failed to retrieve relationships.", error: any }
   */
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

  /**
   * Retrieve relationships by source and type.
   * @requestParams { targetId: string, relationshipType: string } The ID of the source and the relationship type.
   * @response {200} { status: "success", message: "Relationships for target ID {targetId} fetched successfully", data: RelationshipGraph[] }
   * @response {404} { status: "error", message: "No relationships found for target ID {targetId}." }
   * @response {500} { status: "error", message: "Failed to retrieve relationships.", error: any }
   */
  async getRelationshipsBySourceAndType(req: Request, res: Response) {
    const { targetId, relationshipType } = req.params;

    try {
      const relationships = await this.relationshipGraphService.getRelationshipsByTargetAndType(targetId, relationshipType as RelationshipGraph['type']);
      if (!relationships || relationships.length === 0) {
        return respond(res, 404, `No relationships found for target ID ${targetId}.`);
      }
      return respond(res, 200, `Relationships for target ID ${targetId} fetched successfully`, relationships);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve relationships.', null, error);
    }
  }

  /**
   * Add a new relationship.
   * @requestBody { sourceId: string, targetId: string, type: string } The details of the relationship.
   * @response {201} { status: "success", message: "Relationship created successfully.", data: { id: string } }
   * @response {500} { status: "error", message: "Failed to create relationship.", error: any }
   */
  async addRelationship(req: Request, res: Response) {
    const relationship: RelationshipGraph = req.body;
    try {
      const added = await this.relationshipGraphService.addRelationship(relationship);
      if (!added) {
        return respond(res, 400, 'Relationship was not created successfully.');
      }
      return respond(res, 201, 'Relationship created successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to create relationship.', null, error);
    }
  }

  /**
   * Update an existing relationship.
   * @requestParams { id: string } The ID of the relationship to update.
   * @requestBody { sourceId: string, targetId: string, type: string } The updated details of the relationship.
   * @response {200} { status: "success", message: "Relationship updated successfully." }
   * @response {404} { status: "error", message: "Relationship with ID {id} not found or update failed." }
   * @response {500} { status: "error", message: "Failed to update relationship.", error: any }
   */
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

  /**
   * Delete a relationship by ID.
   * @requestParams { id: string } The ID of the relationship to delete.
   * @response {200} { status: "success", message: "Relationship deleted successfully." }
   * @response {404} { status: "error", message: "Relationship with ID {id} not found or delete failed." }
   * @response {500} { status: "error", message: "Failed to delete relationship.", error: any }
   */
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
