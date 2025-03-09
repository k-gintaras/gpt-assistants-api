import { Pool } from 'pg';
import { Request, Response } from 'express';
import { AssistantMemoryControllerService } from '../services/core-services/assistant-memory.controller.service';
import { respond } from './controller.helper';

export class AssistantMemoryController {
  private readonly assistantMemoryService: AssistantMemoryControllerService;

  constructor(db: Pool) {
    this.assistantMemoryService = new AssistantMemoryControllerService(db);
  }

  /**
   * Retrieve all categorized memories for an assistant.
   * @requestParams { id: string } The ID of the assistant.
   * @response {200} { status: "success", message: "Assistant memories fetched successfully", data: AssistantMemoryData }
   * @response {404} { status: "error", message: "No memories found for assistant {id}." }
   * @response {500} { status: "error", message: "Failed to retrieve assistant memories.", error: any }
   */
  async getAssistantMemories(req: Request, res: Response) {
    const { id: assistantId } = req.params;

    try {
      const memories = await this.assistantMemoryService.getAssistantMemories(assistantId);
      if (!memories || (memories.focused.length === 0 && memories.owned.length === 0 && memories.related.length === 0)) {
        return respond(res, 404, `No memories found for assistant ${assistantId}.`);
      }
      return respond(res, 200, 'Assistant memories fetched successfully', memories);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve assistant memories.', null, error);
    }
  }
}
