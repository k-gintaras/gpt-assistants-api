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

  public async ask(conversationRequest: ConversationRequest): Promise<ConversationResponse | null> {
    const { assistantId, userId, chatId, sessionId, prompt } = conversationRequest;
    if (!assistantId || !prompt) return null;

    const assistantData = await this.getAssistantData(assistantId);
    const aiApi = await this.getAiApi(assistantData);
    if (!assistantData || !aiApi?.isAvailable(assistantData.type)) return null;

    const previousMessages = await this.previousConversationService.getConversation(chatId, sessionId);
    const resolvedChatId = await this.getValidChatId(previousMessages);

    const taskId = await this.createPromptTask(assistantId, prompt);
    const aiApiResponse = await this.getAiResponse(aiApi, assistantData, prompt, resolvedChatId, previousMessages);

    if (!aiApiResponse) return null;

    await this.finalizeTask(taskId, aiApiResponse);

    const savedIds = await this.saveInteraction({
      assistantId,
      userId,
      sessionId,
      chatId: aiApiResponse.conversationId,
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

  private async getValidChatId(messages: Awaited<ReturnType<PreviousConversationService['getConversation']>>) {
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
}
