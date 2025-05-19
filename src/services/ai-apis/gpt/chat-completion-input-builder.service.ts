import { AiApiInputBuilder, AiApiContext } from '../../ai-api.model';
import { MemoryTransformerService } from '../../memory-transformer.service';

/**
 * Concrete builder for chat-completion style APIs (e.g., OpenAI GPT).
 * Injects memories & instructions as system messages or prepended chat messages.
 */
export class ChatCompletionInputBuilder extends AiApiInputBuilder {
  private memoryTransformerService: MemoryTransformerService;

  constructor() {
    super();
    this.memoryTransformerService = new MemoryTransformerService();
  }

  buildInput(context: AiApiContext) {
    // Clip focus memories to limit (assume more relevant first)
    const limitedMemories = context.focusMemories.slice(0, context.memoriesLimit);
    const memoryMessages = this.memoryTransformerService.getGptChatMessages(limitedMemories);

    const instructionMessages = context.instructions ? [{ role: 'system', content: context.instructions }] : [];

    // Clip conversation messages to last N (most recent)
    const limitedConvoMessages = context.conversationMessages.length > context.conversationLimit ? context.conversationMessages.slice(-context.conversationLimit) : context.conversationMessages;

    const convoMessages = limitedConvoMessages.map((msg) => ({
      role: msg.owner === 'assistant' ? 'assistant' : 'user',
      content: msg.message,
    }));

    const userMessage = { role: 'user', content: context.userPrompt };

    const messages = [...instructionMessages, ...memoryMessages, ...convoMessages, userMessage];

    return { messages };
  }
}
