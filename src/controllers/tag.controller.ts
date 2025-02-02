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

  /**
   * Add a new tag.
   * @requestBody { name: string } The name of the tag.
   * @response {201} { status: "success", message: "Tag created successfully.", data: { tagId: string } }
   * @response {400} { status: "error", message: "Tag {name} not created." }
   * @response {500} { status: "error", message: "Failed to create tag.", error: any }
   */
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

  /**
   * Remove a tag by ID.
   * @requestParams { tagId: string } The ID of the tag to remove.
   * @response {200} { status: "success", message: "Tag removed successfully." }
   * @response {404} { status: "error", message: "Tag to delete not found." }
   * @response {500} { status: "error", message: "Failed to remove tag.", error: any }
   */
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

  /**
   * Update an existing tag.
   * @requestParams { tagId: string } The ID of the tag to update.
   * @requestBody { name?: string } The updated tag details.
   * @response {200} { status: "success", message: "Tag updated successfully." }
   * @response {404} { status: "error", message: "Tag to update not found." }
   * @response {500} { status: "error", message: "Failed to update tag.", error: any }
   */
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

  /**
   * Retrieve a tag by ID.
   * @requestParams { tagId: string } The ID of the tag to fetch.
   * @response {200} { status: "success", message: "Tag with ID {tagId} fetched successfully", data: Tag }
   * @response {404} { status: "error", message: "Tag with ID {tagId} not found." }
   * @response {500} { status: "error", message: "Failed to retrieve tag.", error: any }
   */
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

  /**
   * Retrieve all tags.
   * @response {200} { status: "success", message: "Tags fetched successfully", data: Tag[] }
   * @response {500} { status: "error", message: "Failed to retrieve tags.", error: any }
   */
  async getAllTags(req: Request, res: Response) {
    try {
      const tags = await this.tagControllerService.getAllTags();
      return respond(res, 200, 'Tags fetched successfully', tags);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve tags.', null, error);
    }
  }
}
