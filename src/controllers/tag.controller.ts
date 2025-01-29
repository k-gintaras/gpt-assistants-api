import { Request, Response } from 'express';
import { TagControllerService } from '../services/core-services/tag.controller.service';
import Database from 'better-sqlite3';
import { Tag } from '../models/tag.model';
import { respond } from './controller.helper';

export class TagController {
  private readonly tagControllerService: TagControllerService;

  constructor(db: Database.Database) {
    this.tagControllerService = new TagControllerService(db);
  }

  async addTag(req: Request, res: Response) {
    const { name } = req.body;
    try {
      const tagId = await this.tagControllerService.addTag({ name });
      if (!tagId) {
        respond(res, 400, `Tag ${name} not created.`);
      }

      return respond(res, 201, 'Tag created successfully.', { tagId });
    } catch (error) {
      return respond(res, 500, 'Failed to create tag.', null, error);
    }
  }

  async removeTag(req: Request, res: Response) {
    const { tagId } = req.params;
    try {
      const removed = await this.tagControllerService.removeTag(tagId);
      if (!removed) {
        return respond(res, 404, 'Tag to delete not found.');
      }
      return respond(res, 200, 'Tag removed successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to remove tag.', null, error);
    }
  }

  async updateTag(req: Request, res: Response) {
    const { tagId } = req.params;
    const updates: Partial<Omit<Tag, 'id'>> = req.body;
    try {
      const updated = await this.tagControllerService.updateTag(tagId, updates);
      if (!updated) {
        return respond(res, 404, 'Tag to update not found.');
      }
      return respond(res, 200, 'Tag updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update tag.', null, error);
    }
  }

  async getTagById(req: Request, res: Response) {
    const { tagId } = req.params;
    try {
      const tag = await this.tagControllerService.getTagById(tagId);

      if (!tag) {
        return respond(res, 404, `Tag with ID ${tagId} not found.`);
      }
      return respond(res, 200, `Tag with ID ${tagId} fetched successfully`, tag);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve tag.', null, error);
    }
  }

  async getAllTags(req: Request, res: Response) {
    try {
      const tags = await this.tagControllerService.getAllTags();
      return respond(res, 200, 'Tags fetched successfully', tags);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve tags.', null, error);
    }
  }
}
