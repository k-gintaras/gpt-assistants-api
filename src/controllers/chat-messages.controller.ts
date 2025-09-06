import { Route, Tags, Post, Get, Body, Path, ValidateError, SuccessResponse } from 'tsoa';
import { ChatMessagesControllerService } from '../services/core-services/chat-messages.controller.service';
import { getDb } from '../database/database';
import { ChatMessage } from '../models/chat-message.model';

@Route('chat-messages')
@Tags('ChatMessages')
export class ChatMessagesController {
  private chatMessageControllerService: ChatMessagesControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.chatMessageControllerService = new ChatMessagesControllerService(pool);
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async addMessage(@Body() body: { chatId: string; memoryId?: string; type: string }): Promise<{ messageId: string }> {
    const created = await this.chatMessageControllerService.addMessage(body.chatId, body.memoryId || '', body.type);
    if (!created || !created.id) throw new ValidateError({}, 'Failed to create message.');
    return { messageId: created.id };
  }

  @Get('/chat/{chatId}')
  public async getMessagesByChatId(@Path() chatId: string): Promise<ChatMessage[]> {
    const messages = await this.chatMessageControllerService.getMessagesByChatId(chatId);
    return messages;
  }
}
