import { Pool } from 'pg';
import { Request, Response } from 'express';
import { TagExtraControllerService } from '../services/core-services/tag-extra.controller.service';
import { respond } from './controller.helper';

export class TagExtraController {
  private readonly tagExtraService: TagExtraControllerService;

  constructor(db: Pool) {
    this.tagExtraService = new TagExtraControllerService(db);
  }

  /**
   * Retrieve tags for a specific entity.
   * @requestParams { entityId: string, entityType: string } The ID and type of the entity (memory, assistant, or task).
   * @response {200} { status: "success", message: "Tags fetched successfully", data: string[] }
   * @response {404} { status: "error", message: "No tags found for entity type {entityType} and ID {entityId}." }
   * @response {500} { status: "error", message: "Failed to retrieve tags.", error: any }
   */
  async getTagsByEntity(req: Request, res: Response) {
    const { entityId, entityType } = req.params;
    try {
      const tags = await this.tagExtraService.getTagsByEntity(entityId, entityType as 'memory' | 'assistant' | 'task');
      if (!tags || tags.length === 0) {
        return respond(res, 404, `No tags found for entity type ${entityType} and ID ${entityId}.`);
      }
      return respond(res, 200, 'Tags fetched successfully', tags);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve tags.', null, error);
    }
  }

  /**
   * Add a tag to an entity.
   * @requestParams { entityId: string, entityType: string, tagId: string, isNames: boolean } The entity ID, type, and tag ID or string names joined with , .
   * @response {201} { status: "success", message: "Tag added successfully to entity." }
   * @response {400} { status: "error", message: "Failed to add tag to entity." }
   * @response {500} { status: "error", message: "Failed to add tag to entity.", error: any }
   */
  async addTagToEntity(req: Request, res: Response) {
    const { entityId, entityType, tagId, isNames } = req.params;

    try {
      let isAdded = false;

      if (isNames) {
        const tags = tagId.split(',');
        if (!tags) return respond(res, 400, 'Failed to add tag to entity.');
        isAdded = await this.tagExtraService.addTagNamesToEntity(entityId, tags, entityType as 'memory' | 'assistant' | 'task');
      } else {
        isAdded = await this.tagExtraService.addTagToEntity(entityId, tagId, entityType as 'memory' | 'assistant' | 'task');
      }

      if (!isAdded) {
        return respond(res, 400, 'Failed to add tag to entity.');
      }
      return respond(res, 201, 'Tag added successfully to entity.');
    } catch (error) {
      return respond(res, 500, 'Failed to add tag to entity.', null, error);
    }
  }

  /**
   * Remove a tag from an entity.
   * @requestParams { entityId: string, entityType: string, tagId: string } The entity ID, type, and tag ID.
   * @response {200} { status: "success", message: "Tag removed successfully from entity." }
   * @response {400} { status: "error", message: "Failed to remove tag from entity." }
   * @response {500} { status: "error", message: "Failed to remove tag from entity.", error: any }
   */
  async removeTagFromEntity(req: Request, res: Response) {
    const { entityId, entityType, tagId } = req.params;
    try {
      const isRemoved = await this.tagExtraService.removeTagFromEntity(entityId, tagId, entityType as 'memory' | 'assistant' | 'task');
      if (!isRemoved) {
        return respond(res, 400, 'Failed to remove tag from entity.');
      }
      return respond(res, 200, 'Tag removed successfully from entity.');
    } catch (error) {
      return respond(res, 500, 'Failed to remove tag from entity.', null, error);
    }
  }
}
