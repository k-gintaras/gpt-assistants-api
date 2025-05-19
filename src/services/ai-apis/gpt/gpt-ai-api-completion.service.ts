import { BaseAiApiService } from '../../ai-api-base.service';
import { AiApiResponse } from '../../ai-api.model';
import { GptMessageArray, generateChatReply } from '../../gpt-api/gpt-api-chat-completion';
import { ChatCompletionInputBuilder } from './chat-completion-input-builder.service';

/**
 * GPT chat-completion AI API service example using modular builder.
 */
export class GptAiApiCompletionService extends BaseAiApiService {
  private defaultModel = 'gpt-3.5-turbo';

  constructor() {
    super(new ChatCompletionInputBuilder());
  }

  isAvailable(assistantType: string): boolean {
    return assistantType.includes('chat'); // might be something else later...
  }

  async callApi(input: { messages: GptMessageArray }) {
    const model = this.defaultModel; // Could be dynamic or from assistantData

    // Here you would add token estimates and limits (omitted for brevity)
    return generateChatReply(model, input.messages, { max_tokens: 300 });
  }

  parseResponse(rawResponse: string | null, conversationId: string | null): AiApiResponse | null {
    if (!rawResponse) return null;

    return {
      response: rawResponse,
      conversationId,
      responseType: 'text',
      error: null,
    };
  }
}
