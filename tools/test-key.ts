import dotenv from 'dotenv';
import { generateChatReply, GptMessageArray } from '../src/services/gpt-api/gpt-api-chat-completion';

dotenv.config();

async function testOpenAIKey() {
  try {
    console.log('Testing OpenAI API key...');

    const messages: GptMessageArray = [
      { role: 'user', content: 'Hello! If you can read this, the API key is working. Please respond with exactly: "API key test successful."' }
    ];

    const response = await generateChatReply('gpt-3.5-turbo', messages, { max_tokens: 20 });

    if (response && response.includes('successful')) {
      console.log('✅ API key test successful!');
      console.log('Response:', response);
    } else {
      console.log('❌ API key test failed. Response:', response);
    }
  } catch (error) {
    console.error('❌ Error testing API key:', error);
  }
}

testOpenAIKey();
