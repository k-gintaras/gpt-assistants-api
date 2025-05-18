import { Request, Response } from 'express';
import { ConversationControllerService } from '../services/core-services/conversation.controller.service';
import { Pool } from 'pg';
import { respond } from './controller.helper';

export class ConversationController {
  private readonly conversationControllerService: ConversationControllerService;

  constructor(db: Pool) {
    this.conversationControllerService = new ConversationControllerService(db);
  }

  /**
   * Process a conversation request.
   * @requestBody { assistantId: string, userId: string, chatId: string, sessionId: string, prompt: string }
   * @response {200} { status: "success", message: "Response generated", data: any }
   * @response {400} { status: "error", message: "Missing assistantId or prompt." }
   * @response {500} { status: "error", message: "Failed to process conversation.", error: any }
   */
  async ask(req: Request, res: Response) {
    const { assistantId, userId = null, chatId = null, sessionId = null, prompt } = req.body;
    try {
      const response = await this.conversationControllerService.ask({ assistantId, userId, chatId, sessionId, prompt });
      return respond(res, 200, 'Response generated', response);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message) {
        return respond(res, 400, error.message);
      }
      return respond(res, 500, 'Failed to process conversation request', null, error);
    }
  }
}
