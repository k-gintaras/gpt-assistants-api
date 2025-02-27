import { addThreadMessage, createNewThread, extractAssistantReply, fetchThreadMessages, waitForRunCompletion } from '../../services/gpt-api/gpt-api-thread';

// Set global timeout for all tests
jest.setTimeout(60000);

describe('Integration Test for GPT Assistant API', () => {
  const assistantId = 'asst_E0I1qScIqcfCUfAls7nDKTf7';

  // Helper function to generate unique test data
  const generateUniqueTestData = () => {
    const uniqueId = Math.random().toString(36).substring(2, 8);
    return {
      uniqueId,
      fact: `Planet ${uniqueId} has three moons named Alpha${uniqueId}, Beta${uniqueId}, and Gamma${uniqueId}.`,
      query: `Tell me about Planet ${uniqueId} and its moons.`,
    };
  };

  it('should process memories sent as a single consolidated message', async () => {
    // Create thread with unique test data
    const testData = generateUniqueTestData();
    const threadId = await createNewThread('Consolidated Memory Test', 'test-user');
    if (!threadId) throw new Error('Thread ID not set.');

    // Send all memories as a single message with clear formatting
    const memoryContext = `
      INSTRUCTIONS:
      You are a planetary expert assistant.
      
      KNOWLEDGE BASE:
      ${testData.fact}
    `;

    await addThreadMessage(threadId, 'user', memoryContext);
    await addThreadMessage(threadId, 'user', testData.query);
    await waitForRunCompletion(threadId, assistantId);

    const messages = await fetchThreadMessages(threadId);
    if (!messages) throw new Error('messages ID not set.');

    const response = extractAssistantReply(messages);

    // Verify response contains unique identifiers
    expect(response).toContain(testData.uniqueId);
    expect(response).toContain(`Alpha${testData.uniqueId}`);
  }, 15000);

  //   it('should process memories sent as separate messages', async () => {
  //     const testData = generateUniqueTestData();
  //     const threadId = await createNewThread('Separate Messages Test', 'test-user');

  //     if (!threadId) throw new Error('Thread ID not set.');

  //     // Send memories as separate messages
  //     await addThreadMessage(threadId, 'user', `INSTRUCTION: You are a planetary expert assistant.`);
  //     await addThreadMessage(threadId, 'user', `KNOWLEDGE: ${testData.fact}`);
  //     await addThreadMessage(threadId, 'user', testData.query);
  //     await waitForRunCompletion(threadId, assistantId);

  //     const messages = await fetchThreadMessages(threadId);
  //     if (!messages) throw new Error('me ID not set.');

  //     const response = extractAssistantReply(messages);

  //     expect(response).toContain(testData.uniqueId);
  //   }, 15000);

  //   it('should test memory persistence across multiple queries', async () => {
  //     const testData = generateUniqueTestData();
  //     const threadId = await createNewThread('Persistence Test', 'test-user');
  //     if (!threadId) throw new Error('Thread ID not set.');

  //     // Add memory
  //     await addThreadMessage(threadId, 'user', `KNOWLEDGE: ${testData.fact}`);

  //     // First query
  //     await addThreadMessage(threadId, 'user', testData.query);
  //     await waitForRunCompletion(threadId, assistantId);

  //     // Second query - intentionally vague
  //     await addThreadMessage(threadId, 'user', 'What were the names of the moons again?');
  //     await waitForRunCompletion(threadId, assistantId);

  //     const messages = await fetchThreadMessages(threadId);
  //     if (!messages) throw new Error('m ID not set.');

  //     const response = extractAssistantReply(messages);

  //     // Verify the assistant remembers the information
  //     expect(response).toContain(`Alpha${testData.uniqueId}`);
  //     expect(response).toContain(`Beta${testData.uniqueId}`);
  //   }, 15000);

  //   it('should test system vs. user message memory retention', async () => {
  //     const testData = generateUniqueTestData();

  //     // Test with system message
  //     const systemThreadId = await createNewThread('System Message Test', 'test-user');
  //     if (!systemThreadId) throw new Error('Thread ID not set.');

  //     await addThreadMessage(systemThreadId, 'assistant', testData.fact); // Use system role
  //     await addThreadMessage(systemThreadId, 'user', testData.query);
  //     await waitForRunCompletion(systemThreadId, assistantId);

  //     const systemMessages = await fetchThreadMessages(systemThreadId);
  //     if (!systemMessages) throw new Error('systemMessages ID not set.');
  //     const systemResponse = extractAssistantReply(systemMessages);

  //     // Test with user message
  //     const userThreadId = await createNewThread('User Message Test', 'test-user');
  //     if (!userThreadId) throw new Error('userThreadId ID not set.');

  //     await addThreadMessage(userThreadId, 'user', testData.fact); // Use user role
  //     await addThreadMessage(userThreadId, 'user', testData.query);
  //     await waitForRunCompletion(userThreadId, assistantId);

  //     const userMessages = await fetchThreadMessages(userThreadId);
  //     if (!userMessages) throw new Error('userMessages ID not set.');

  //     const userResponse = extractAssistantReply(userMessages);
  //     if (!systemResponse) throw new Error('systemResponse ID not set.');
  //     if (!userResponse) throw new Error('userResponse ID not set.');

  //     // Compare effectiveness
  //     const systemHasInfo = systemResponse.includes(testData.uniqueId);
  //     const userHasInfo = userResponse.includes(testData.uniqueId);

  //     console.log({
  //       'System message retention': systemHasInfo,
  //       'User message retention': userHasInfo,
  //     });

  //     // At least one approach should work
  //     expect(systemHasInfo || userHasInfo).toBe(true);
  //   }, 20000); // Longer timeout for this comparative test

  //   it('should compare different memory formatting styles', async () => {
  //     const testData = generateUniqueTestData();

  //     const formats = [
  //       {
  //         name: 'plain',
  //         format: testData.fact,
  //       },
  //       {
  //         name: 'labeled',
  //         format: `KNOWLEDGE: ${testData.fact}`,
  //       },
  //       {
  //         name: 'structured',
  //         format: JSON.stringify({
  //           type: 'knowledge',
  //           content: testData.fact,
  //         }),
  //       },
  //       {
  //         name: 'markdown',
  //         format: `## Planet Knowledge\n\n${testData.fact}`,
  //       },
  //     ];

  //     const results = [];

  //     for (const format of formats) {
  //       const threadId = await createNewThread(`Format Test: ${format.name}`, 'test-user');
  //       if (!threadId) throw new Error('threadId ID not set.');

  //       await addThreadMessage(threadId, 'user', format.format);
  //       await addThreadMessage(threadId, 'user', testData.query);
  //       await waitForRunCompletion(threadId, assistantId);

  //       const messages = await fetchThreadMessages(threadId);
  //       if (!messages) throw new Error('messages ID not set.');

  //       const response = extractAssistantReply(messages);
  //       if (!response) throw new Error('response ID not set.');

  //       results.push({
  //         format: format.name,
  //         containsInfo: response.includes(testData.uniqueId),
  //         mentionsMoons: response.includes(`Alpha${testData.uniqueId}`) && response.includes(`Beta${testData.uniqueId}`),
  //       });
  //     }

  //     console.table(results);

  //     // At least one format should work effectively
  //     expect(results.some((r) => r.containsInfo && r.mentionsMoons)).toBe(true);
  //   }, 25000); // Longer timeout for this multi-part test
});
