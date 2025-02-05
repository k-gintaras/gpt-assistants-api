import { Pool } from 'pg';
import { Request, Response } from 'express';
import { MemoryExtraControllerService } from '../services/core-services/memory-extra.controller.service';
import { respond } from './controller.helper';

export class MemoryExtraController {
  private readonly memoryExtraService: MemoryExtraControllerService;

  constructor(db: Pool) {
    this.memoryExtraService = new MemoryExtraControllerService(db);
  }

  /**
   * Retrieve all memories with their associated tags.
   * @response {200} { status: "success", message: "Memories with tags fetched successfully", data: Memory[] }
   * @response {404} { status: "error", message: "No memories found." }
   * @response {500} { status: "error", message: "Failed to retrieve memories with tags.", error: any }
   */
  async getMemoriesWithTags(_req: Request, res: Response) {
    try {
      const memoriesWithTags = await this.memoryExtraService.getMemoriesWithTags();
      if (memoriesWithTags.length === 0) {
        return respond(res, 404, 'No memories found.');
      }
      return respond(res, 200, 'Memories with tags fetched successfully', memoriesWithTags);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memories with tags.', null, error);
    }
  }

  /**
   * Retrieve memories by tags.
   * @requestQuery { tags: string } Comma-separated tags to filter memories.
   * @response {200} { status: "success", message: "Memories for the provided tags fetched successfully", data: Memory[] }
   * @response {400} { status: "error", message: "Tags query parameter is required and should be a string." }
   * @response {404} { status: "error", message: "No memories found for the provided tags." }
   * @response {500} { status: "error", message: "Failed to retrieve memories by tags.", error: any }
   */
  async getMemoriesByTags(req: Request, res: Response) {
    const { tags } = req.query;
    if (!tags || typeof tags !== 'string') {
      return respond(res, 400, 'Tags query parameter is required and should be a string.');
    }

    const tagArray = tags.split(',');
    try {
      const memories = await this.memoryExtraService.getMemoriesByTags(tagArray);
      if (memories.length === 0) {
        return respond(res, 404, 'No memories found for the provided tags.');
      }
      return respond(res, 200, 'Memories for the provided tags fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memories by tags.', null, error);
    }
  }

  /**
   * Update tags for a memory.
   * @requestParams { memoryId: string } The ID of the memory to update.
   * @requestBody { newTags: string[] } The new tags to associate with the memory.
   * @response {200} { status: "success", message: "Memory tags updated successfully" }
   * @response {400} { status: "error", message: "New tags must be an array." }
   * @response {404} { status: "error", message: "Memory with ID {memoryId} not found or update failed." }
   * @response {500} { status: "error", message: "Failed to update memory tags.", error: any }
   */
  async updateMemoryTags(req: Request, res: Response) {
    const { memoryId } = req.params;
    const { newTags } = req.body;

    if (!newTags || !Array.isArray(newTags)) {
      return respond(res, 400, 'New tags must be an array.');
    }

    try {
      const isUpdated = await this.memoryExtraService.updateMemoryTags(memoryId, newTags);
      if (!isUpdated) {
        return respond(res, 404, `Memory with ID ${memoryId} not found or update failed.`);
      }
      return respond(res, 200, 'Memory tags updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update memory tags.', null, error);
    }
  }
}
