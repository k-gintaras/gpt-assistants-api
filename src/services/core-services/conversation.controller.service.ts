import { Pool } from 'pg';
import { ConversationRequest, ConversationResponse, ConversationService } from '../orchestrator-services/conversation/conversation.service';

export class ConversationControllerService {
  conversationService: ConversationService;

  constructor(pool: Pool) {
    this.conversationService = new ConversationService(pool);
  }

  async ask(request: ConversationRequest): Promise<ConversationResponse | null> {
    return await this.conversationService.ask(request);
  }
}
