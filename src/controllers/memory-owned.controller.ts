import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { OwnedMemoryControllerService } from '../services/core-services/memory-owned.controller.service';
import { respond } from './controller.helper';

export class OwnedMemoryController {
  private readonly ownedMemoryService: OwnedMemoryControllerService;

  constructor(db: Database.Database) {
    this.ownedMemoryService = new OwnedMemoryControllerService(db);
  }

  async getMemoriesByAssistantId(req: Request, res: Response) {
    const { assistantId } = req.params;

    try {
      const memories = await this.ownedMemoryService.getMemoriesByAssistantId(assistantId);
      if (memories.length === 0) {
        return respond(res, 404, `No memories found for assistant with ID ${assistantId}.`);
      }
      return respond(res, 200, 'Memories fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memories.', null, error);
    }
  }

  async getOwnedMemories(req: Request, res: Response) {
    const { assistantId } = req.params;

    try {
      const memories = await this.ownedMemoryService.getOwnedMemories(assistantId);
      if (memories.length === 0) {
        return respond(res, 404, `No owned memories found for assistant with ID ${assistantId}.`);
      }
      return respond(res, 200, 'Owned memories fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve owned memories.', null, error);
    }
  }

  async addOwnedMemory(req: Request, res: Response) {
    const { assistantId, memoryId } = req.params;

    try {
      const isAdded = await this.ownedMemoryService.addOwnedMemory(assistantId, memoryId);
      if (!isAdded) {
        return respond(res, 400, `Failed to add memory with ID ${memoryId} to assistant with ID ${assistantId}.`);
      }
      return respond(res, 201, 'Memory added to assistant successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to add memory to assistant.', null, error);
    }
  }

  async removeOwnedMemory(req: Request, res: Response) {
    const { assistantId, memoryId } = req.params;

    try {
      const isRemoved = await this.ownedMemoryService.removeOwnedMemory(assistantId, memoryId);
      if (!isRemoved) {
        return respond(res, 400, `Failed to remove memory with ID ${memoryId} from assistant with ID ${assistantId}.`);
      }
      return respond(res, 200, 'Memory removed from assistant successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to remove memory from assistant.', null, error);
    }
  }

  async updateOwnedMemories(req: Request, res: Response) {
    const { assistantId } = req.params;
    const { memoryIds } = req.body;

    if (!Array.isArray(memoryIds)) {
      return respond(res, 400, 'Memory IDs must be an array.');
    }

    try {
      const isUpdated = await this.ownedMemoryService.updateOwnedMemories(assistantId, memoryIds);
      if (!isUpdated) {
        return respond(res, 400, `Failed to update owned memories for assistant with ID ${assistantId}.`);
      }
      return respond(res, 200, 'Owned memories updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update owned memories.', null, error);
    }
  }
}
