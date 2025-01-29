import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { FocusedMemoryControllerService } from '../services/core-services/memory-focused.controller.service';
import { respond } from './controller.helper';

export class FocusedMemoryController {
  private readonly focusedMemoryService: FocusedMemoryControllerService;

  constructor(db: Database.Database) {
    this.focusedMemoryService = new FocusedMemoryControllerService(db);
  }

  async getFocusedMemoriesByAssistantId(req: Request, res: Response) {
    const { assistantId } = req.params;

    try {
      const memories = await this.focusedMemoryService.getFocusedMemoriesByAssistantId(assistantId);
      if (memories.length === 0) {
        return respond(res, 404, `No focused memories found for assistant with ID ${assistantId}.`);
      }
      return respond(res, 200, 'Focused memories fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve focused memories.', null, error);
    }
  }

  async getFocusedMemories(req: Request, res: Response) {
    const { memoryFocusId } = req.params;

    try {
      const memories = await this.focusedMemoryService.getFocusedMemories(memoryFocusId);
      if (memories.length === 0) {
        return respond(res, 404, `No focused memories found for focus ID ${memoryFocusId}.`);
      }
      return respond(res, 200, 'Focused memories fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve focused memories.', null, error);
    }
  }

  async addFocusedMemory(req: Request, res: Response) {
    const { memoryFocusId, memoryId } = req.params;

    try {
      const isAdded = await this.focusedMemoryService.addFocusedMemory(memoryFocusId, memoryId);
      if (!isAdded) {
        return respond(res, 400, `Failed to add memory with ID ${memoryId} to focus group with ID ${memoryFocusId}.`);
      }
      return respond(res, 201, 'Memory added to focus group successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to add memory to focus group.', null, error);
    }
  }

  async removeFocusedMemory(req: Request, res: Response) {
    const { memoryFocusId, memoryId } = req.params;

    try {
      const isRemoved = await this.focusedMemoryService.removeFocusedMemory(memoryFocusId, memoryId);
      if (!isRemoved) {
        return respond(res, 400, `Failed to remove memory with ID ${memoryId} from focus group with ID ${memoryFocusId}.`);
      }
      return respond(res, 200, 'Memory removed from focus group successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to remove memory from focus group.', null, error);
    }
  }

  async updateFocusedMemories(req: Request, res: Response) {
    const { memoryFocusId } = req.params;
    const { memoryIds } = req.body;

    if (!Array.isArray(memoryIds)) {
      return respond(res, 400, 'Memory IDs must be an array.');
    }

    try {
      const isUpdated = await this.focusedMemoryService.updateFocusedMemories(memoryFocusId, memoryIds);
      if (!isUpdated) {
        return respond(res, 400, `Failed to update focused memories for focus group with ID ${memoryFocusId}.`);
      }
      return respond(res, 200, 'Focused memories updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update focused memories.', null, error);
    }
  }
}
