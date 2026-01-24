import { Pool } from 'pg';
import { ConversationRequest, ConversationResponse, ConversationService } from '../orchestrator-services/conversation/conversation.service';
import { ChainService } from '../orchestrator-services/chain/chain.service';
import { RelayChainService } from '../orchestrator-services/chain/relay-chain.service';
import { BroadcastChainInput, ChainProgress, RelayChainInput, RelayChainProgress } from '../../models/chain.model';

export class ConversationControllerService {
  conversationService: ConversationService;
  chainService: ChainService;
  relayChainService: RelayChainService;

  constructor(pool: Pool) {
    this.conversationService = new ConversationService(pool);
    this.chainService = new ChainService(pool);
    this.relayChainService = new RelayChainService(pool);
  }

  async ask(request: ConversationRequest): Promise<ConversationResponse | null> {
    try {
      return await this.conversationService.ask(request);
    } catch (error) {
      console.error('[ConversationControllerService.ask] Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async planBroadcastChain(input: BroadcastChainInput) {
    return await this.chainService.planBroadcastChain(input);
  }

  async runBroadcastChain(parentId: string) {
    // Run in background
    this.chainService.runBroadcastChain(parentId).catch(err => {
      console.error('Error running broadcast chain:', err);
    });
    return { message: 'Chain execution started' };
  }

  async getChainProgress(parentId: string): Promise<ChainProgress> {
    return await this.chainService.getChainProgress(parentId);
  }

  async planRelayChain(input: RelayChainInput) {
    return await this.relayChainService.planRelayChain(input);
  }

  async runRelayChain(parentId: string) {
    // Run in background
    this.relayChainService.runRelayChain(parentId).catch(err => {
      console.error('Error running relay chain:', err);
    });
    return { message: 'Relay chain execution started' };
  }

  async getRelayChainProgress(parentId: string): Promise<RelayChainProgress> {
    return await this.relayChainService.getRelayChainProgress(parentId);
  }
}
