import { Route, Tags, Get, Query, ValidateError } from 'tsoa';
import { ConversationControllerService } from '../services/core-services/conversation.controller.service';
import { getDb } from '../database/database';

@Route('simple-conversation')
@Tags('Simple Conversation')
export class SimpleConversationController {
  private readonly conversationControllerService: ConversationControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.conversationControllerService = new ConversationControllerService(pool);
  }

  @Get('/')
  public async chat(
    @Query() assistantId: string,
    @Query() message: string,
    @Query() chatId?: string
  ): Promise<string> {
    // Basic parameter validation — throw ValidateError so TSOA returns a 400
    if (!assistantId || !message) {
      throw new ValidateError({}, 'Missing assistantId or message');
    }

    try {
      const response = await this.conversationControllerService.ask({
        assistantId,
        userId: null,
        chatId: chatId || null,
        sessionId: null,
        prompt: message
      });

      if (!response) {
        return 'No response received';
      }

      // Return chatId at the top, then the answer
      return `${response.chatId || 'new-chat'}\n${response.answer}`;
    } catch (error) {
      // Return error as text
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}