import { addThreadMessage, createNewThread, extractAssistantReply, fetchThreadMessages, queryAssistant, waitForRunCompletion } from '../../services/gpt-api/gpt-api-thread';

describe('Integration Test for GPT Assistant API', () => {
  const assistantId = 'asst_7ISKYusMXvzmPq9IDqQVxqFW'; // Replace with your assistant ID
  const testPrompt = 'Hello, what can you do?';
  let threadId: string | null = null;

  beforeAll(() => {
    jest.setTimeout(60000); // Allow sufficient time for long-running API calls
  });

  it('should create a new thread successfully', async () => {
    threadId = await createNewThread('Integration Test Thread', 'test-user');
    expect(threadId).not.toBeNull();
    console.log('Thread created with ID:', threadId);
  });

  it('should add a message to the thread', async () => {
    if (!threadId) throw new Error('Thread ID not set.');

    const messageId = await addThreadMessage(threadId, 'user', testPrompt);
    expect(messageId).not.toBeNull();
    console.log('Message added with ID:', messageId);
  });

  it('should start and complete an assistant run', async () => {
    if (!threadId) throw new Error('Thread ID not set.');

    const run = await waitForRunCompletion(threadId, assistantId, 'Provide a detailed response.');
    expect(run).not.toBeNull();
    expect(run?.status).toBe('completed');
    console.log('Run completed with ID:', run?.id);
  }, 30000); // Timeout extended for this test

  it('should retrieve all messages from the thread', async () => {
    if (!threadId) throw new Error('Thread ID not set.');

    const messages = await fetchThreadMessages(threadId);
    expect(messages).not.toBeNull();
    expect(messages?.data).toHaveLength(2); // Assumes one user message and one assistant response
    console.log('Messages retrieved:', messages);
  });

  it('should extract the assistant’s response', async () => {
    if (!threadId) throw new Error('Thread ID not set.');

    const messages = await fetchThreadMessages(threadId);
    if (!messages) throw new Error('Failed to retrieve messages.');

    const assistantReply = extractAssistantReply(messages);
    expect(assistantReply).not.toBeNull();
    console.log('Assistant response:', assistantReply);
  });

  it('should query the assistant and get a direct response', async () => {
    const response = await queryAssistant(assistantId, testPrompt, 'Respond concisely.');
    expect(response).not.toBeNull();
    console.log('Query response:', response);
  }, 30000); // Timeout extended for this test

  afterAll(() => {
    console.log('Integration tests completed.');
  });
});
