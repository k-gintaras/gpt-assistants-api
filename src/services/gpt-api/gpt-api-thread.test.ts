import { getOpenAI } from './gpt-api-connector';

/**
 * Test function to demonstrate OpenAI Assistant API functionality with threads and messages
 * @param assistantId The ID of your pre-created assistant
 */
async function testAssistantWithThread(assistantId: string) {
  try {
    const openai = getOpenAI();
    console.log('Starting Assistant API test...');

    // Step 1: Create a new thread
    console.log('Creating a new thread...');
    const thread = await openai.beta.threads.create({
      metadata: { purpose: 'Testing Assistant API', created_by: 'test_script' },
    });
    console.log(`Thread created with ID: ${thread.id}`);

    // Step 2: Add initial messages to the thread
    console.log('Adding initial messages to the thread...');

    // First message - context about a project
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: "I'm building a task management application that needs to track projects, tasks, and deadlines.",
    });

    // Second message - specific question
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'What database schema would you recommend for storing tasks and their relationships to projects?',
    });

    console.log('Messages added to thread');

    // Step 3: Run the assistant on the thread
    console.log('Running assistant on thread...');
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
      instructions: 'You are a helpful assistant specializing in software architecture and database design.',
    });

    console.log(`Run completed with status: ${run.status}`);

    // Step 4: Retrieve the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);

    // Find the most recent assistant message
    const assistantMessage = messages.data.filter((msg) => msg.role === 'assistant').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    // Extract and display the response text
    if (assistantMessage && assistantMessage.content) {
      const contentBlock = assistantMessage.content.find((block) => block.type === 'text');
      if (contentBlock && 'text' in contentBlock) {
        console.log("\nAssistant's response to the initial messages:");
        console.log('=======================================');
        console.log(contentBlock.text.value);
        console.log('=======================================\n');
      }
    }

    // Step 5: Add a follow-up message to the thread
    console.log('Adding a follow-up message...');
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Also, how would you handle recurring tasks in this schema?',
    });

    // Step 6: Run the assistant again on the updated thread
    console.log('Running assistant on updated thread...');
    const followUpRun = await openai.beta.threads.runs.createAndPoll(thread.id, { assistant_id: assistantId });

    console.log(`Follow-up run completed with status: ${followUpRun.status}`);

    // Step 7: Retrieve the assistant's response to the follow-up
    const updatedMessages = await openai.beta.threads.messages.list(thread.id);

    // Find the most recent assistant message after the follow-up
    const followUpResponse = updatedMessages.data.filter((msg) => msg.role === 'assistant').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    // Extract and display the response text
    if (followUpResponse && followUpResponse.content) {
      const contentBlock = followUpResponse.content.find((block) => block.type === 'text');
      if (contentBlock && 'text' in contentBlock) {
        console.log("\nAssistant's response to the follow-up:");
        console.log('=======================================');
        console.log(contentBlock.text.value);
        console.log('=======================================\n');
      }
    }

    console.log('Test completed successfully');

    return {
      threadId: thread.id,
      initialRunId: run.id,
      followUpRunId: followUpRun.id,
    };
  } catch (error) {
    console.error('Error during test:', error);
    throw error;
  }
}

// Execute the test with your assistant ID
// Replace "asst_abc123" with your actual assistant ID
testAssistantWithThread('asst_E0I1qScIqcfCUfAls7nDKTf7')
  .then((result) => {
    console.log('Test summary:', result);
  })
  .catch((error) => {
    console.error('Test failed:', error);
  });
