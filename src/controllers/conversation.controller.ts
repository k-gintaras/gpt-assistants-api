import { Route, Tags, Post, Body, ValidateError, Get, Path, Security } from 'tsoa';
import { ConversationControllerService } from '../services/core-services/conversation.controller.service';
import { getDb } from '../database/database';
import { ConversationRequest, ConversationResponse } from '../services/orchestrator-services/conversation/conversation.service';
import { BroadcastChainInput, ChainProgress, RelayChainInput, RelayChainProgress } from '../models/chain.model';

@Route('conversation')
@Tags('Conversation')
export class ConversationController {
  private readonly conversationControllerService: ConversationControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.conversationControllerService = new ConversationControllerService(pool);
  }

  @Post('/')
  @Security('claims', ['canUseGpt'])
  public async ask(@Body() body: ConversationRequest): Promise<ConversationResponse> {
    if (!body?.assistantId || !body?.prompt) {
      throw new ValidateError({}, 'Missing assistantId or prompt');
    }

    try {
      // Normalize undefined to null for optional fields
      const normalizedBody: ConversationRequest = {
        assistantId: body.assistantId,
        prompt: body.prompt,
        userId: body.userId ?? null,
        chatId: body.chatId ?? null,
        sessionId: body.sessionId ?? null,
      };

      const response = await this.conversationControllerService.ask(normalizedBody);
      if (!response) {
        throw new Error('Service returned null response');
      }
      return response as ConversationResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[Conversation.ask] Error:', errorMessage);
      throw new ValidateError({}, `Failed to process conversation: ${errorMessage}`);
    }
  }

  @Post('/chain/broadcast')
  @Security('claims', ['canUseGpt'])
  public async planBroadcastChain(@Body() body: BroadcastChainInput) {
    if (!body?.assistantIds?.length || !body?.messages?.length) {
      throw new ValidateError({}, 'Missing assistantIds or messages');
    }

    const result = await this.conversationControllerService.planBroadcastChain(body);
    return result;
  }

  @Post('/chain/run/{parentId}')
  @Security('claims', ['canUseGpt'])
  public async runBroadcastChain(@Path() parentId: string) {
    const result = await this.conversationControllerService.runBroadcastChain(parentId);
    return result;
  }

  @Get('/chain/progress/{parentId}')
  @Security('claims', ['canUseGpt'])
  public async getChainProgress(@Path() parentId: string): Promise<ChainProgress> {
    const progress = await this.conversationControllerService.getChainProgress(parentId);
    return progress;
  }

  @Post('/chain/relay')
  @Security('claims', ['canUseGpt'])
  public async planRelayChain(@Body() body: RelayChainInput) {
    if (!body?.steps?.length) {
      throw new ValidateError({}, 'Missing steps');
    }

    const result = await this.conversationControllerService.planRelayChain(body);
    return result;
  }

  @Post('/chain/relay/run/{parentId}')
  @Security('claims', ['canUseGpt'])
  public async runRelayChain(@Path() parentId: string) {
    const result = await this.conversationControllerService.runRelayChain(parentId);
    return result;
  }

  @Get('/chain/relay/progress/{parentId}')
  @Security('claims', ['canUseGpt'])
  public async getRelayChainProgress(@Path() parentId: string): Promise<RelayChainProgress> {
    const progress = await this.conversationControllerService.getRelayChainProgress(parentId);
    return progress;
  }
}
