import dotenv from 'dotenv';
import { generateChatReply, GptMessageArray } from '../../src/services/gpt-api/gpt-api-chat-completion';

dotenv.config();

describe('OpenAI API Key Integration Test', () => {
  it('should successfully call OpenAI API with valid key', async () => {
    const messages: GptMessageArray = [
      { role: 'user', content: 'Hello! If the API key works, respond with "Key is valid".' }
    ];

    const response = await generateChatReply('gpt-3.5-turbo', messages, { max_tokens: 10 });

    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
    expect(response!.length).toBeGreaterThan(0);
  }, 30000); // Increase timeout for API call
});
