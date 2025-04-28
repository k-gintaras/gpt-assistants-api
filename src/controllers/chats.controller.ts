import { Request, Response } from 'express';
import { Pool } from 'pg';
import { respond } from './controller.helper';
import { ChatsControllerService } from '../services/core-services/chats.controller.service';

export class ChatsController {
  private readonly chatControllerService: ChatsControllerService;

  constructor(db: Pool) {
    this.chatControllerService = new ChatsControllerService(db);
  }

  /**
   * Create a new chat within a session.
   * @requestBody { sessionId: string }
   * @response {201} { status: "success", message: "Chat created successfully.", data: { chatId: string } }
   * @response {400} { status: "error", message: "Chat not created." }
   * @response {500} { status: "error", message: "Failed to create chat.", error: any }
   */
  async createChat(req: Request, res: Response) {
    const { sessionId } = req.body;
    try {
      const chatId = await this.chatControllerService.createChat(sessionId);
      return respond(res, 201, 'Chat created successfully.', { chatId });
    } catch (error) {
      return respond(res, 500, 'Failed to create chat.', null, error);
    }
  }

  /**
   * Get all chats for a session.
   * @requestParams { sessionId: string }
   * @response {200} { status: "success", message: "Chats fetched successfully", data: Chat[] }
   * @response {500} { status: "error", message: "Failed to retrieve chats.", error: any }
   */
  async getChatsBySessionId(req: Request, res: Response) {
    const { sessionId } = req.params;
    try {
      const chats = await this.chatControllerService.getChatsBySessionId(sessionId);
      return respond(res, 200, 'Chats fetched successfully', chats);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve chats.', null, error);
    }
  }
}
