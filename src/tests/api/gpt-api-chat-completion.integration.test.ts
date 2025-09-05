import { createChatCompletion, generateChatReply, extendConversation, GptMessageArray } from '../../services/gpt-api/gpt-api-chat-completion';

describe('Integration Test for Chat Completion Functions', () => {
  const model = 'gpt-3.5-turbo-16k'; // Use your desired model here
  let conversationHistory: GptMessageArray = [];

  beforeAll(() => {
    jest.setTimeout(30000); // Extend timeout for API calls
  });

  it('should create a chat completion successfully', async () => {
    const messages: Array<{ role: 'user' | 'developer' | 'assistant'; content: string }> = [
      { role: 'developer', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a haiku about recursion in programming.' },
    ];

    const response = await createChatCompletion(model, messages, { max_tokens: 50 });
    expect(response).not.toBeNull();
    expect(response?.choices).toBeDefined();
    expect(response?.choices[0]?.message?.content).toBeDefined();

    console.log('Chat Completion Response:', response?.choices[0]?.message?.content);
  });

  it('should generate a chat reply for a given conversation', async () => {
    conversationHistory = [
      { role: 'developer', content: 'You are an expert on JavaScript.' },
      { role: 'user', content: 'What are closures in JavaScript?' },
    ];

    const reply = await generateChatReply(model, conversationHistory, { max_tokens: 50 });
    expect(reply).not.toBeNull();
    console.log('Generated Reply:', reply);

    if (reply) {
      conversationHistory = extendConversation(conversationHistory, [{ role: 'assistant', content: reply }]);
    }
  });
});
