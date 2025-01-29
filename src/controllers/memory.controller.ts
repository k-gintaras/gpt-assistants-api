import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { MemoryControllerService } from '../services/core-services/memory.controller.service';
import { Memory } from '../models/memory.model';
import { respond } from './controller.helper';

export class MemoryController {
  private readonly memoryService: MemoryControllerService;

  constructor(db: Database.Database) {
    this.memoryService = new MemoryControllerService(db);
  }

  async getMemories(_req: Request, res: Response) {
    try {
      const memories = this.memoryService.getMemories();
      if (!memories || memories.length === 0) {
        return respond(res, 404, 'No memories found.');
      }
      return respond(res, 200, 'Memories fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memories.', null, error);
    }
  }

  async getMemory(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const memory = this.memoryService.getMemory(id);
      if (!memory) {
        return respond(res, 404, `Memory with ID ${id} not found.`);
      }
      return respond(res, 200, `Memory with ID ${id} fetched successfully`, memory);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memory.', null, error);
    }
  }

  async createMemory(req: Request, res: Response) {
    const memory: Memory = req.body;
    try {
      const memoryId = this.memoryService.createMemory(memory);
      if (!memoryId) {
        return respond(res, 400, 'Failed to create memory.');
      }
      return respond(res, 201, 'Memory created successfully.', { id: memoryId });
    } catch (error) {
      return respond(res, 500, 'Failed to create memory.', null, error);
    }
  }

  async updateMemory(req: Request, res: Response) {
    const { id } = req.params;
    const memory: Memory = req.body;
    if (memory.id !== id) {
      return respond(res, 400, 'Memory ID mismatch.');
    }
    try {
      const isUpdated = this.memoryService.updateMemory(memory);
      if (!isUpdated) {
        return respond(res, 404, `Memory with ID ${id} not found or update failed.`);
      }
      return respond(res, 200, 'Memory updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update memory.', null, error);
    }
  }

  async deleteMemory(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const isDeleted = this.memoryService.deleteMemory(id);
      if (!isDeleted) {
        return respond(res, 404, `Memory with ID ${id} not found or delete failed.`);
      }
      return respond(res, 200, 'Memory deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete memory.', null, error);
    }
  }
}
