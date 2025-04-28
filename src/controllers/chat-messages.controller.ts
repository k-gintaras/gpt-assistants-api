import { Request, Response } from 'express';
import { Pool } from 'pg';
import { respond } from './controller.helper';
import { ChatMessagesControllerService } from '../services/core-services/chat-messages.controller.service';

export class ChatMessagesController {
  private readonly chatMessageControllerService: ChatMessagesControllerService;

  constructor(db: Pool) {
    this.chatMessageControllerService = new ChatMessagesControllerService(db);
  }

  /**
   * Add a message to a chat.
   * @requestBody { chatId: string, memoryId: string, type: string }
   * @response {201} { status: "success", message: "Message created successfully.", data: { messageId: string } }
   * @response {500} { status: "error", message: "Failed to create message.", error: any }
   */
  async addMessage(req: Request, res: Response) {
    const { chatId, memoryId, type } = req.body;
    try {
      const messageId = await this.chatMessageControllerService.addMessage(chatId, memoryId, type);
      return respond(res, 201, 'Message created successfully.', { messageId });
    } catch (error) {
      return respond(res, 500, 'Failed to create message.', null, error);
    }
  }

  /**
   * Get all messages for a chat.
   * @requestParams { chatId: string }
   * @response {200} { status: "success", message: "Messages fetched successfully", data: ChatMessage[] }
   * @response {500} { status: "error", message: "Failed to retrieve messages.", error: any }
   */
  async getMessagesByChatId(req: Request, res: Response) {
    const { chatId } = req.params;
    try {
      const messages = await this.chatMessageControllerService.getMessagesByChatId(chatId);
      return respond(res, 200, 'Messages fetched successfully', messages);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve messages.', null, error);
    }
  }
}
