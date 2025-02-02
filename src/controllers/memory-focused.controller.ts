import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { FocusedMemoryControllerService } from '../services/core-services/memory-focused.controller.service';
import { respond } from './controller.helper';

export class FocusedMemoryController {
  private readonly focusedMemoryService: FocusedMemoryControllerService;

  constructor(db: Database.Database) {
    this.focusedMemoryService = new FocusedMemoryControllerService(db);
  }

  /**
   * Retrieve focused memories by assistant ID.
   * @requestParams { assistantId: string } The ID of the assistant.
   * @response {200} { status: "success", message: "Focused memories fetched successfully", data: Memory[] }
   * @response {404} { status: "error", message: "No focused memories found for assistant with ID {assistantId}." }
   * @response {500} { status: "error", message: "Failed to retrieve focused memories.", error: any }
   */
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

  /**
   * Retrieve focused memories by focus ID.
   * @requestParams { memoryFocusId: string } The ID of the memory focus.
   * @response {200} { status: "success", message: "Focused memories fetched successfully", data: Memory[] }
   * @response {404} { status: "error", message: "No focused memories found for focus ID {memoryFocusId}." }
   * @response {500} { status: "error", message: "Failed to retrieve focused memories.", error: any }
   */
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

  /**
   * Add a memory to a focus group.
   * @requestParams { memoryFocusId: string, memoryId: string } The IDs of the memory focus group and the memory.
   * @response {201} { status: "success", message: "Memory added to focus group successfully." }
   * @response {400} { status: "error", message: "Failed to add memory with ID {memoryId} to focus group with ID {memoryFocusId}." }
   * @response {500} { status: "error", message: "Failed to add memory to focus group.", error: any }
   */
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

  /**
   * Remove a memory from a focus group.
   * @requestParams { memoryFocusId: string, memoryId: string } The IDs of the memory focus group and the memory.
   * @response {200} { status: "success", message: "Memory removed from focus group successfully." }
   * @response {400} { status: "error", message: "Failed to remove memory with ID {memoryId} from focus group with ID {memoryFocusId}." }
   * @response {500} { status: "error", message: "Failed to remove memory from focus group.", error: any }
   */
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

  /**
   * Update focused memories in a focus group.
   * @requestParams { memoryFocusId: string } The ID of the memory focus group.
   * @requestBody { memoryIds: string[] } The list of memory IDs to update.
   * @response {200} { status: "success", message: "Focused memories updated successfully." }
   * @response {400} { status: "error", message: "Memory IDs must be an array." }
   * @response {500} { status: "error", message: "Failed to update focused memories.", error: any }
   */
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
