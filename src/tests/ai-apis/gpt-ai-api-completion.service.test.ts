import { MemoryWithTags } from '../../models/memory.model';
import { GptAiApiCompletionService } from '../../services/ai-apis/gpt/gpt-ai-api-completion.service';
import { ConversationMessage } from '../../services/orchestrator-services/conversation/previous-conversation.service';
import * as gptApiHelper from '../../services/gpt-api/gpt-api-chat-completion';
import { AiApiRequest } from '../../services/ai-api.model';

jest.mock('../../services/gpt-api/gpt-api-chat-completion', () => ({
  ...jest.requireActual('../../services/gpt-api/gpt-api-chat-completion'),
  generateChatReply: jest.fn(),
  extractChatReply: jest.requireActual('../../services/gpt-api/gpt-api-chat-completion').extractChatReply,
}));

describe('GptAiApiService integration', () => {
  let service: GptAiApiCompletionService;

  beforeEach(() => {
    service = new GptAiApiCompletionService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return response on successful completion', async () => {
    const mockedReply = 'Mocked GPT response';
    (gptApiHelper.generateChatReply as jest.Mock).mockResolvedValue(mockedReply);

    const fakeMemories: MemoryWithTags[] = [{ id: 'm1', description: 'Memory 1', tags: [], name: null, summary: null, type: '', data: null, createdAt: null, updatedAt: null }];

    const fakeConversation: ConversationMessage[] = [
      { chatId: 'chat1', owner: 'user', message: 'Hello?', createdAt: new Date() },
      { chatId: 'chat1', owner: 'assistant', message: 'Hi!', createdAt: new Date() },
    ];

    const request: AiApiRequest = {
      assistantData: {
        id: 'assistant1',
        model: 'gpt-3.5-turbo',
        name: 'Test Assistant',
        description: 'Helpful assistant',
        type: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        focusedMemories: fakeMemories,
        feedbackSummary: { avgRating: 5, totalFeedback: 10 },
      },
      prompt: 'What is AI?',
      memories: fakeMemories,
      conversationId: 'conv123',
      conversationMessages: fakeConversation,
    };

    const response = await service.ask(request);

    expect(response).not.toBeNull();
    expect(response?.response).toBe(mockedReply);
    expect(response?.conversationId).toBe('conv123');
    expect(response?.error).toBeNull();

    expect(gptApiHelper.generateChatReply).toHaveBeenCalledTimes(1);
    const [model, messages] = (gptApiHelper.generateChatReply as jest.Mock).mock.calls[0];
    expect(model).toBe('gpt-3.5-turbo');
    expect(Array.isArray(messages)).toBe(true);
  });

  it('should handle errors and return error message', async () => {
    (gptApiHelper.generateChatReply as jest.Mock).mockRejectedValue(new Error('API failure'));

    const request: AiApiRequest = {
      assistantData: {
        id: 'assistant1',
        model: 'gpt-3.5-turbo',
        name: 'Test Assistant',
        description: 'Helpful assistant',
        type: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        focusedMemories: [],
        feedbackSummary: { avgRating: 5, totalFeedback: 10 },
      },
      prompt: 'Hello?',
      memories: [],
      conversationId: 'convError',
      conversationMessages: [],
    };

    const response = await service.ask(request);

    expect(response).not.toBeNull();
    expect(response?.response).toBe('');
    expect(response?.conversationId).toBe('convError');
    expect(response?.error).toContain('API failure');
  });
});
