import { AssistantWithDetails } from '../models/assistant.model';
import { MemoryWithTags } from '../models/memory.model';
import { GptAiApiService } from './ai-apis/gpt-aiapi.service';
import { ConversationMessage } from './orchestrator-services/conversation/previous-conversation.service';

/* eslint-disable @typescript-eslint/no-unused-vars */
export interface AiApiRequest {
  assistantData: AssistantWithDetails; // assistant data, we need to pass it to the api
  prompt: string;
  memories: MemoryWithTags[] | null; // extra memories
  conversationId: string | null;
  conversationMessages: ConversationMessage[] | null; // previous conversation messages (probably with owner type too)
}

export interface AiApiResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
  responseType: string; // text, image, sound, error, etc.
  conversationId: string | null; // chat id, if there is one (and if it is newly created)
  error: string | null; // if there is an error, it will be here
}

export interface AiApi {
  isAvailable(assistantType: string): boolean; // it is possible that this api might be disabled...
  // add some other stuffs
  // consider maybe response could be image or sound?
  ask(request: AiApiRequest): Promise<AiApiResponse | null>; // this is the main function, it will be called with the prompt and return the answer
}

export class AiApiService {
  constructor() {}

  getAiApi(assistantType: string): AiApi | null {
    return new GptAiApiService();
  }
}
