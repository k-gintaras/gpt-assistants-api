import { Pool } from 'pg';
import { Request, Response } from 'express';
import { OwnedMemoryControllerService } from '../services/core-services/memory-owned.controller.service';
import { respond } from './controller.helper';

export class OwnedMemoryController {
  private readonly ownedMemoryService: OwnedMemoryControllerService;

  constructor(db: Pool) {
    this.ownedMemoryService = new OwnedMemoryControllerService(db);
  }

  /**
   * Retrieve memories owned by an assistant.
   * @requestParams { assistantId: string } The ID of the assistant.
   * @response {200} { status: "success", message: "Memories fetched successfully", data: Memory[] }
   * @response {404} { status: "error", message: "No memories found for assistant with ID {assistantId}." }
   * @response {500} { status: "error", message: "Failed to retrieve memories.", error: any }
   */
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

  /**
   * Retrieve all owned memories for an assistant.
   * @requestParams { assistantId: string } The ID of the assistant.
   * @response {200} { status: "success", message: "Owned memories fetched successfully", data: Memory[] }
   * @response {404} { status: "error", message: "No owned memories found for assistant with ID {assistantId}." }
   * @response {500} { status: "error", message: "Failed to retrieve owned memories.", error: any }
   */
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

  /**
   * Add a memory to an assistant's collection of owned memories.
   * @requestParams { assistantId: string, memoryId: string } The ID of the assistant and memory.
   * @response {201} { status: "success", message: "Memory added to assistant successfully." }
   * @response {400} { status: "error", message: "Failed to add memory with ID {memoryId} to assistant with ID {assistantId}." }
   * @response {500} { status: "error", message: "Failed to add memory to assistant.", error: any }
   */
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

  /**
   * Remove a memory from an assistant's collection of owned memories.
   * @requestParams { assistantId: string, memoryId: string } The ID of the assistant and memory.
   * @response {200} { status: "success", message: "Memory removed from assistant successfully." }
   * @response {400} { status: "error", message: "Failed to remove memory with ID {memoryId} from assistant with ID {assistantId}." }
   * @response {500} { status: "error", message: "Failed to remove memory from assistant.", error: any }
   */
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

  /**
   * Update the owned memories for an assistant.
   * @requestParams { assistantId: string } The ID of the assistant.
   * @requestBody { memoryIds: string[] } The list of memory IDs to update.
   * @response {200} { status: "success", message: "Owned memories updated successfully." }
   * @response {400} { status: "error", message: "Memory IDs must be an array." }
   * @response {500} { status: "error", message: "Failed to update owned memories.", error: any }
   */
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
