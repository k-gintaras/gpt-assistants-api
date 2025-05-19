import { AiApiRequest, AiApiResponse } from '../../ai-api.model';
import { AiApi } from '../../ai-api.service';
import { GptThreadMessageArray, GptThreadMessage, createNewThread, addMultipleMessagesAndPrompt, waitForRunCompletion, getAssistantReply } from '../../gpt-api/gpt-api-thread';

export class GptAiApiThreadsService implements AiApi {
  isAvailable(assistantType: string): boolean {
    return assistantType.includes('assistant');
  }

  /**
   * Sends conversation messages and user prompt as thread messages,
   * waits for assistant run completion, then fetches and returns reply.
   */
  async ask(request: AiApiRequest): Promise<AiApiResponse | null> {
    try {
      const assistantId = request.assistantData.gptAssistantId;
      if (!assistantId) throw new Error('Missing gpt assistantId');

      const threadId = request.conversationId ?? (await createNewThread('Conversation Thread', assistantId));
      if (!threadId) throw new Error('Failed to get or create thread');

      const messages: GptThreadMessageArray = request.conversationMessages
        ? request.conversationMessages.map((msg) => ({
            role: msg.owner === 'assistant' ? 'assistant' : 'user',
            content: msg.message,
          }))
        : [];

      const promptMessage: GptThreadMessage = {
        role: 'user',
        content: request.prompt,
      };

      // Add new conversation messages + prompt to the thread
      const messageIds = await addMultipleMessagesAndPrompt(threadId, messages, promptMessage);
      if (messageIds.length === 0) throw new Error('Failed to add messages to thread');

      // Start or continue assistant run and wait for completion
      const run = await waitForRunCompletion(threadId, assistantId, request.assistantData.description);
      if (!run) throw new Error('Assistant run did not complete');

      // Fetch assistant reply
      const reply = await getAssistantReply(threadId);

      return {
        response: reply ?? '',
        conversationId: threadId, // reuse existing or new threadId
        responseType: 'text',
        error: null,
      };
    } catch (error) {
      return {
        response: '',
        conversationId: request.conversationId ?? null,
        responseType: 'text',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
