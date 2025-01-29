import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { TagExtraControllerService } from '../services/core-services/tag-extra.controller.service';
import { respond } from './controller.helper';

export class TagExtraController {
  private readonly tagExtraService: TagExtraControllerService;

  constructor(db: Database.Database) {
    this.tagExtraService = new TagExtraControllerService(db);
  }

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

  async addTagToEntity(req: Request, res: Response) {
    const { entityId, entityType, tagId } = req.params;
    try {
      const isAdded = await this.tagExtraService.addTagToEntity(entityId, tagId, entityType as 'memory' | 'assistant' | 'task');
      if (!isAdded) {
        return respond(res, 400, 'Failed to add tag to entity.');
      }
      return respond(res, 201, 'Tag added successfully to entity.');
    } catch (error) {
      return respond(res, 500, 'Failed to add tag to entity.', null, error);
    }
  }

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
