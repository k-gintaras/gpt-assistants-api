import { AiApiRequest, AiApiResponse } from './ai-api.model';
import { GptAiApiCompletionService } from './ai-apis/gpt/gpt-ai-api-completion.service';
import { GptAiApiThreadsService } from './ai-apis/gpt/gpt-ai-api-thread.service';

export interface AiApi {
  isAvailable(assistantType: string): boolean; // it is possible that this api might be disabled...
  // add some other stuffs
  // consider maybe response could be image or sound?
  ask(request: AiApiRequest): Promise<AiApiResponse | null>; // this is the main function, it will be called with the prompt and return the answer
}

export class AiApiService {
  constructor() {}

  getAiApi(assistantType: string): AiApi | null {
    switch (assistantType) {
      // probably later change to gpt-chat gpt-assistant, if later we add something like claude-chat...
      case 'chat':
        return new GptAiApiCompletionService();
      case 'assistant':
        return new GptAiApiThreadsService();
      // Add other AI APIs here as needed
      default:
        return null; // or throw an error if no API is found
    }
  }
}
