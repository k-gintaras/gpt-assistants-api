import { Pool } from 'pg';
import { FocusedMemoryService } from '../../sqlite-services/focused-memory.service';
import { ConversationMessage, PreviousConversationService } from './previous-conversation.service';
import { FullAssistantService } from '../../sqlite-services/assistant-full.service';
import { AssistantWithDetails } from '../../../models/assistant.model';
import { AiApi, AiApiRequest, AiApiResponse, AiApiService } from '../../ai-api.service';
import { Conversation, ConversationSaverService } from './conversation-saver.service';
import { ChatLifecycleService } from '../chat-lifecycle.service';
import { TaskService } from '../../sqlite-services/task.service';

export interface ConversationRequest {
  assistantId: string;
  userId: string | null;
  chatId: string | null;
  sessionId: string | null;
  prompt: string;
}

export interface ConversationResponse {
  assistantId: string;
  userId: string | null;
  chatId: string | null;
  sessionId: string | null;
  responseType: string | null; // "text", "image"
  answer: string;
}
export class ConversationService {
  focusedMemoryService: FocusedMemoryService;
  previousConversationService: PreviousConversationService;
  assistantService: FullAssistantService;
  aiApiService: AiApiService;
  conversationSaver: ConversationSaverService;
  chatLifecycleService: ChatLifecycleService;
  taskService: TaskService;

  constructor(private pool: Pool) {
    this.assistantService = new FullAssistantService(pool);
    this.focusedMemoryService = new FocusedMemoryService(pool);
    this.previousConversationService = new PreviousConversationService(pool);
    this.conversationSaver = new ConversationSaverService(pool);
    this.chatLifecycleService = new ChatLifecycleService(pool);
    this.taskService = new TaskService(pool);
    this.aiApiService = new AiApiService();
  }

  public async ask(conversationRequest: ConversationRequest): Promise<ConversationResponse> {
    const { assistantId, userId, chatId, sessionId, prompt } = conversationRequest;

    if (!assistantId || !prompt) {
      throw new Error('Missing assistantId or prompt');
    }

    await this.validateConversationReferences(chatId, sessionId);

    const assistant = await this.getAssistantData(assistantId);
    if (!assistant) {
      throw new Error(`Assistant not found: ${assistantId}`);
    }

    const aiApi = await this.getAiApi(assistant);
    if (!aiApi?.isAvailable(assistant.type)) {
      throw new Error(`AI API is unavailable for assistant type: ${assistant.type}`);
    }

    const previousMessages = await this.previousConversationService.getConversation(chatId, sessionId);
    const resolvedChatId = await this.getValidChatId(chatId, previousMessages);

    const taskId = await this.createPromptTask(assistantId, prompt);

    const aiApiResponse = await this.getAiResponse(aiApi, assistant, prompt, resolvedChatId, previousMessages);
    if (!aiApiResponse) {
      throw new Error('AI API failed to return a response');
    }

    await this.finalizeTask(taskId, aiApiResponse);

    const savedIds = await this.saveInteraction({
      assistantId,
      userId,
      sessionId,
      chatId: aiApiResponse.conversationId ?? resolvedChatId,
      userPrompt: prompt,
      aiResponse: this.extractResponse(aiApiResponse),
      taskId,
    });

    return {
      assistantId,
      userId,
      chatId: savedIds.chatId,
      sessionId: savedIds.sessionId,
      responseType: aiApiResponse.responseType,
      answer: aiApiResponse.response,
    };
  }

  private async getAssistantData(id: string) {
    return this.assistantService.getFullAssistantWithDetailsEfficient(id);
  }

  private async getAiApi(assistant: AssistantWithDetails | null) {
    if (!assistant) return null;
    return this.aiApiService.getAiApi(assistant.type);
  }

  private async getValidChatId(inputChatId: string | null, messages: ConversationMessage[] | null) {
    // First, check if we have an input chatId and if it's valid (not expired)
    if (inputChatId) {
      const expired = await this.chatLifecycleService.isChatExpired(inputChatId);
      if (!expired) {
        return inputChatId; // Use the provided chat ID if it's valid
      }
    }

    // Fallback to getting chatId from messages if no valid input chatId
    if (!messages?.length) return null;
    const chatId = messages[0].chatId;
    const expired = await this.chatLifecycleService.isChatExpired(chatId);
    return expired ? null : chatId;
  }

  private async createPromptTask(assistantId: string, prompt: string): Promise<string> {
    return this.taskService.addTask({
      description: `Prompt initiated: ${prompt}`,
      assignedAssistant: assistantId,
      status: 'pending',
      inputData: JSON.stringify({ prompt }),
      outputData: null,
    });
  }

  private async getAiResponse(api: AiApi, assistant: AssistantWithDetails, prompt: string, chatId: string | null, messages: ConversationMessage[] | null) {
    const request: AiApiRequest = {
      assistantData: assistant,
      prompt,
      memories: assistant.focusedMemories,
      conversationId: chatId,
      conversationMessages: messages,
    };
    return api.ask(request);
  }

  private extractResponse(apiResponse: AiApiResponse): string {
    return apiResponse.responseType === 'text' ? apiResponse.response : apiResponse.responseType;
  }

  private async finalizeTask(taskId: string, apiResponse: AiApiResponse) {
    const stringResponse = this.extractResponse(apiResponse);
    await this.taskService.updateTask(taskId, {
      status: 'completed',
      outputData: JSON.stringify({ stringResponse }),
    });
  }

  private async saveInteraction(convo: Conversation): Promise<{ sessionId: string; chatId: string }> {
    return this.conversationSaver.saveConversation(convo);
  }

  private async validateConversationReferences(chatId: string | null, sessionId: string | null): Promise<void> {
    if (sessionId) {
      const sessionExists = await this.previousConversationService.sessionExists(sessionId);
      if (!sessionExists) throw new Error('Invalid session ID.');
    }
    if (chatId) {
      const sessionExists = await this.previousConversationService.chatExists(chatId);
      if (!sessionExists) throw new Error('Invalid chat ID.');
    }

    if (chatId && sessionId) {
      const isMatch = await this.previousConversationService.chatBelongsToSession(chatId, sessionId);
      if (!isMatch) throw new Error('Chat ID does not match the provided session.');
    }
  }
}
