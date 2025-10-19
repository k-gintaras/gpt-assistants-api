import { Route, Tags, Post, Body, ValidateError, Get, Path } from 'tsoa';
import { ConversationControllerService } from '../services/core-services/conversation.controller.service';
import { getDb } from '../database/database';
import { ConversationRequest, ConversationResponse } from '../services/orchestrator-services/conversation/conversation.service';
import { BroadcastChainInput, ChainProgress } from '../models/chain.model';

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

  @Post('/chain/broadcast')
  public async planBroadcastChain(@Body() body: BroadcastChainInput) {
    if (!body?.assistantIds?.length || !body?.messages?.length) {
      throw new ValidateError({}, 'Missing assistantIds or messages');
    }

    const result = await this.conversationControllerService.planBroadcastChain(body);
    return result;
  }

  @Post('/chain/run/{parentId}')
  public async runBroadcastChain(@Path() parentId: string) {
    const result = await this.conversationControllerService.runBroadcastChain(parentId);
    return result;
  }

  @Get('/chain/progress/{parentId}')
  public async getChainProgress(@Path() parentId: string): Promise<ChainProgress> {
    const progress = await this.conversationControllerService.getChainProgress(parentId);
    return progress;
  }
}
