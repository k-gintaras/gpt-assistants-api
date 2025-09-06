import { Route, Tags, Post, Body, ValidateError } from 'tsoa';
import { ConversationControllerService } from '../services/core-services/conversation.controller.service';
import { getDb } from '../database/database';
import { ConversationRequest, ConversationResponse } from '../services/orchestrator-services/conversation/conversation.service';

@Route('conversation')
@Tags('Conversation')
export class ConversationController {
  private readonly conversationControllerService: ConversationControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.conversationControllerService = new ConversationControllerService(pool);
  }

  @Post('/')
  public async ask(@Body() body: ConversationRequest): Promise<ConversationResponse> {
    // Basic parameter validation — throw ValidateError so TSOA returns a 400
    if (!body?.assistantId || !body?.prompt) {
      throw new ValidateError({}, 'Missing assistantId or prompt');
    }

    const response = await this.conversationControllerService.ask(body);
    return response as ConversationResponse;
  }
}
