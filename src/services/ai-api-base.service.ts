import { AssistantWithDetails } from '../models/assistant.model';
import { AiApiInputBuilder, AiApiRequest, AiApiResponse, AiApiContext } from './ai-api.model';
import { AiApi } from './ai-api.service';

/**
 * Base AI API Service that uses an AiApiInputBuilder to
 * prepare input from context, then calls API, then parses response.
 */
export abstract class BaseAiApiService implements AiApi {
  protected inputBuilder: AiApiInputBuilder;

  constructor(inputBuilder: AiApiInputBuilder) {
    this.inputBuilder = inputBuilder;
  }

  abstract isAvailable(assistantType: string): boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract callApi(input: any): Promise<any>;

  async ask(request: AiApiRequest): Promise<AiApiResponse | null> {
    try {
      const assistant = request.assistantData as AssistantWithDetails;
      const messageLimits = assistant.memoryFocusRule?.maxResults || 5;
      const memoriesLimit = Math.floor(messageLimits / 2);
      const conversationLimit = Math.ceil(messageLimits / 2);

      const context: AiApiContext = {
        focusMemories: request.memories ?? [],
        conversationMessages: request.conversationMessages ?? [],
        instructions: assistant.description || '',
        userPrompt: request.prompt,
        memoriesLimit: memoriesLimit,
        conversationLimit: conversationLimit,
      };

      const input = this.inputBuilder.buildInput(context);
      const rawResponse = await this.callApi(input);

      return this.parseResponse(rawResponse, request.conversationId);
    } catch (err) {
      return {
        response: '',
        conversationId: request.conversationId ?? null,
        responseType: 'text',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract parseResponse(rawResponse: any, conversationId: string | null): AiApiResponse | null;
}
