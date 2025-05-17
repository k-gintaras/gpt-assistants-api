import { AiApi, AiApiRequest, AiApiResponse } from '../ai-api.service';

export class GptAiApiService implements AiApi {
  constructor() {}

  isAvailable(assistantType: string): boolean {
    return assistantType.indexOf('chat') !== -1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ask(request: AiApiRequest): Promise<AiApiResponse | null> {
    const responseExample: AiApiResponse = {
      response: 'This is a test response from GPT API' + new Date().toUTCString(),
      conversationId: null,
      responseType: 'text',
      error: null,
    };
    return responseExample;
  }
}
