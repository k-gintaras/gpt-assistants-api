import { Route, Tags, Post, Get, Body, Path, ValidateError, SuccessResponse } from 'tsoa';
import { ChatsControllerService } from '../services/core-services/chats.controller.service';
import { getDb } from '../database/database';
import { Chat } from '../models/chat.model';

@Route('chats')
@Tags('Chats')
export class ChatsController {
  private chatControllerService: ChatsControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.chatControllerService = new ChatsControllerService(pool);
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async createChat(@Body() body: { sessionId: string }): Promise<{ chatId: string }> {
    const created = await this.chatControllerService.createChat(body.sessionId);
    if (!created || !created.id) throw new ValidateError({}, 'Failed to create chat.');
    return { chatId: created.id };
  }

  @Get('/session/{sessionId}')
  public async getChatsBySessionId(@Path() sessionId: string): Promise<Chat[]> {
    const chats = await this.chatControllerService.getChatsBySessionId(sessionId);
    return chats;
  }
}
