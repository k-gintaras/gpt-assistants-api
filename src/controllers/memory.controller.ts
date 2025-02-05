import { Pool } from 'pg';
import { Request, Response } from 'express';
import { MemoryControllerService } from '../services/core-services/memory.controller.service';
import { Memory } from '../models/memory.model';
import { respond } from './controller.helper';

export class MemoryController {
  private readonly memoryService: MemoryControllerService;

  constructor(db: Pool) {
    this.memoryService = new MemoryControllerService(db);
  }

  /**
   * Retrieve all memories.
   * @response {200} { status: "success", message: "Memories fetched successfully", data: Memory[] }
   * @response {404} { status: "error", message: "No memories found." }
   * @response {500} { status: "error", message: "Failed to retrieve memories.", error: any }
   */
  async getMemories(_req: Request, res: Response) {
    try {
      const memories = await this.memoryService.getMemories();
      if (!memories || memories.length === 0) {
        return respond(res, 404, 'No memories found.');
      }
      return respond(res, 200, 'Memories fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memories.', null, error);
    }
  }

  /**
   * Retrieve a memory by ID.
   * @requestParams { id: string } The ID of the memory.
   * @response {200} { status: "success", message: "Memory with ID {id} fetched successfully", data: Memory }
   * @response {404} { status: "error", message: "Memory with ID {id} not found." }
   * @response {500} { status: "error", message: "Failed to retrieve memory.", error: any }
   */
  async getMemory(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const memory = await this.memoryService.getMemory(id);
      if (!memory) {
        return respond(res, 404, `Memory with ID ${id} not found.`);
      }
      return respond(res, 200, `Memory with ID ${id} fetched successfully`, memory);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memory.', null, error);
    }
  }

  /**
   * Create a new memory.
   * @requestBody { content: string, type: string } The details of the memory.
   * @response {201} { status: "success", message: "Memory created successfully.", data: { id: string } }
   * @response {400} { status: "error", message: "Failed to create memory." }
   * @response {500} { status: "error", message: "Failed to create memory.", error: any }
   */
  async createMemory(req: Request, res: Response) {
    const memory: Memory = req.body;
    try {
      const memoryId = await this.memoryService.createMemory(memory);
      if (!memoryId) {
        return respond(res, 400, 'Failed to create memory.');
      }
      return respond(res, 201, 'Memory created successfully.', { id: memoryId });
    } catch (error) {
      return respond(res, 500, 'Failed to create memory.', null, error);
    }
  }

  /**
   * Update an existing memory.
   * @requestParams { id: string } The ID of the memory to update.
   * @requestBody { content: string, type: string } The updated details of the memory.
   * @response {200} { status: "success", message: "Memory updated successfully" }
   * @response {400} { status: "error", message: "Memory ID mismatch." }
   * @response {404} { status: "error", message: "Memory with ID {id} not found or update failed." }
   * @response {500} { status: "error", message: "Failed to update memory.", error: any }
   */
  async updateMemory(req: Request, res: Response) {
    const { id } = req.params;
    const memory: Memory = req.body;
    if (memory.id !== id) {
      return respond(res, 400, 'Memory ID mismatch.');
    }
    try {
      const isUpdated = await this.memoryService.updateMemory(memory);
      if (!isUpdated) {
        return respond(res, 404, `Memory with ID ${id} not found or update failed.`);
      }
      return respond(res, 200, 'Memory updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update memory.', null, error);
    }
  }

  /**
   * Delete a memory by ID.
   * @requestParams { id: string } The ID of the memory to delete.
   * @response {200} { status: "success", message: "Memory deleted successfully" }
   * @response {404} { status: "error", message: "Memory with ID {id} not found or delete failed." }
   * @response {500} { status: "error", message: "Failed to delete memory.", error: any }
   */
  async deleteMemory(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const isDeleted = await this.memoryService.deleteMemory(id);
      if (!isDeleted) {
        return respond(res, 404, `Memory with ID ${id} not found or delete failed.`);
      }
      return respond(res, 200, 'Memory deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete memory.', null, error);
    }
  }
}
