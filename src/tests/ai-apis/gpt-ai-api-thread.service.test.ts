import { MemoryWithTags } from '../../models/memory.model';
import { AiApiRequest } from '../../services/ai-api.model';
import { GptAiApiThreadsService } from '../../services/ai-apis/gpt/gpt-ai-api-thread.service';
import * as threadsHelper from '../../services/gpt-api/gpt-api-thread';
import { ConversationMessage } from '../../services/orchestrator-services/conversation/previous-conversation.service';

jest.mock('../../services/gpt-api/gpt-api-thread', () => ({
  createNewThread: jest.fn(),
  addMultipleMessagesAndPrompt: jest.fn(),
  waitForRunCompletion: jest.fn(),
  getAssistantReply: jest.fn(),
}));

describe('GptThreadsAiApiService integration', () => {
  let service: GptAiApiThreadsService;

  beforeEach(() => {
    service = new GptAiApiThreadsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return assistant reply reusing existing threadId', async () => {
    const assistantId = 'gpt-assistant-123';
    const existingThreadId = 'thread-456';

    (threadsHelper.createNewThread as jest.Mock).mockResolvedValue('new-thread-id'); // Should NOT be called in this test
    (threadsHelper.addMultipleMessagesAndPrompt as jest.Mock).mockResolvedValue(['msg1', 'msg2']);
    (threadsHelper.waitForRunCompletion as jest.Mock).mockResolvedValue({ status: 'completed' });
    (threadsHelper.getAssistantReply as jest.Mock).mockResolvedValue('Threaded assistant reply');

    const fakeMemories: MemoryWithTags[] = [];
    const fakeConversation: ConversationMessage[] = [
      { chatId: existingThreadId, owner: 'user', message: 'Hi there', createdAt: new Date() },
      { chatId: existingThreadId, owner: 'assistant', message: 'Hello!', createdAt: new Date() },
    ];

    const request: AiApiRequest = {
      assistantData: {
        id: 'assistant1',
        gptAssistantId: assistantId,
        model: 'gpt-4o',
        name: 'Threaded Assistant',
        description: 'Thread assistant description',
        type: 'assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        focusedMemories: fakeMemories,
        feedbackSummary: { avgRating: 5, totalFeedback: 10 },
      },
      prompt: 'Continue our chat please',
      memories: fakeMemories,
      conversationId: existingThreadId, // reusing existing thread
      conversationMessages: fakeConversation,
    };

    const response = await service.ask(request);

    expect(response).not.toBeNull();
    expect(response?.response).toBe('Threaded assistant reply');
    expect(response?.conversationId).toBe(existingThreadId);
    expect(response?.error).toBeNull();

    // createNewThread NOT called, since conversationId was provided
    expect(threadsHelper.createNewThread).not.toHaveBeenCalled();

    expect(threadsHelper.addMultipleMessagesAndPrompt).toHaveBeenCalledWith(existingThreadId, expect.any(Array), { role: 'user', content: 'Continue our chat please' });

    expect(threadsHelper.waitForRunCompletion).toHaveBeenCalledWith(existingThreadId, assistantId, 'Thread assistant description');

    expect(threadsHelper.getAssistantReply).toHaveBeenCalledWith(existingThreadId);
  });

  it('should create new thread if no conversationId provided', async () => {
    const assistantId = 'gpt-assistant-123';
    const newThreadId = 'new-thread-789';

    (threadsHelper.createNewThread as jest.Mock).mockResolvedValue(newThreadId);
    (threadsHelper.addMultipleMessagesAndPrompt as jest.Mock).mockResolvedValue(['msg1']);
    (threadsHelper.waitForRunCompletion as jest.Mock).mockResolvedValue({ status: 'completed' });
    (threadsHelper.getAssistantReply as jest.Mock).mockResolvedValue('New thread reply');

    const request: AiApiRequest = {
      assistantData: {
        id: 'assistant1',
        gptAssistantId: assistantId,
        model: 'gpt-4o',
        name: 'Threaded Assistant',
        description: 'Thread assistant description',
        type: 'assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        focusedMemories: [],
        feedbackSummary: { avgRating: 5, totalFeedback: 10 },
      },
      prompt: 'Start a new thread please',
      memories: [],
      conversationId: null,
      conversationMessages: [],
    };

    const response = await service.ask(request);

    expect(response).not.toBeNull();
    expect(response?.response).toBe('New thread reply');
    expect(response?.conversationId).toBe(newThreadId);
    expect(response?.error).toBeNull();

    expect(threadsHelper.createNewThread).toHaveBeenCalledWith('Conversation Thread', assistantId);
    expect(threadsHelper.addMultipleMessagesAndPrompt).toHaveBeenCalledWith(newThreadId, [], { role: 'user', content: 'Start a new thread please' });
    expect(threadsHelper.waitForRunCompletion).toHaveBeenCalledWith(newThreadId, assistantId, 'Thread assistant description');
    expect(threadsHelper.getAssistantReply).toHaveBeenCalledWith(newThreadId);
  });

  it('should throw error if gptAssistantId missing', async () => {
    const request: AiApiRequest = {
      assistantData: {
        id: 'assistant1',
        gptAssistantId: undefined,
        model: 'gpt-4o',
        name: 'Threaded Assistant',
        description: 'Thread assistant description',
        type: 'assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        focusedMemories: [],
        feedbackSummary: { avgRating: 5, totalFeedback: 10 },
      },
      prompt: 'Hello?',
      memories: [],
      conversationId: null,
      conversationMessages: [],
    };

    const response = await service.ask(request);

    expect(response).not.toBeNull();
    expect(response?.response).toBe('');
    expect(response?.error).toContain('Missing gpt assistantId');
  });

  it('should handle errors gracefully', async () => {
    (threadsHelper.createNewThread as jest.Mock).mockRejectedValue(new Error('Thread creation failed'));

    const request: AiApiRequest = {
      assistantData: {
        id: 'assistant1',
        gptAssistantId: 'gpt-assistant-123',
        model: 'gpt-4o',
        name: 'Threaded Assistant',
        description: 'Thread assistant description',
        type: 'assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        focusedMemories: [],
        feedbackSummary: { avgRating: 5, totalFeedback: 10 },
      },
      prompt: 'Hello?',
      memories: [],
      conversationId: null,
      conversationMessages: [],
    };

    const response = await service.ask(request);

    expect(response).not.toBeNull();
    expect(response?.response).toBe('');
    expect(response?.error).toContain('Thread creation failed');
  });
});
