import { AssistantTool, FunctionTool } from 'openai/resources/beta/assistants';
import { GptAssistantCreateRequest } from '../../services/gpt-api/gpt-api-models.model';
import { createAssistant, getAssistantById, updateAssistant, deleteAssistant } from '../../services/gpt-api/gpt-api-assistant';
import dotenv from 'dotenv';
import { FunctionParameters } from 'openai/resources';

// Load environment variables from .env file
dotenv.config();

describe('OpenAI Assistant API Integration Tests', () => {
  const functionParameters: FunctionParameters = {
    lalala: () => {
      return 'trololol';
    },
  };
  const functionTool: FunctionTool = {
    function: {
      name: 'singAsong',
      parameters: functionParameters,
    },
    type: 'function',
  };
  const tool: AssistantTool = functionTool;
  const examplePayload: GptAssistantCreateRequest = {
    model: 'gpt-4o',
    instructions: 'You are a helpful assistant for testing.',
    name: 'Test Assistant 999',
    description: 'This assistant is created for testing purposes.',
    tools: [tool],
    metadata: { category: 'integration-test' },
    temperature: 0.7,
    top_p: 0.9,
    response_format: 'auto',
  };

  let assistantId: string;

  it('should create an assistant', async () => {
    const response = await createAssistant(examplePayload);

    if (!response) return;
    console.log('Create Response:', response);

    expect(response).toHaveProperty('id');
    expect(response.model).toBe(examplePayload.model);
    assistantId = response.id; // Save the assistant ID for other tests
  });

  it('should retrieve the created assistant', async () => {
    if (!assistantId) {
      throw new Error('Assistant ID is not set. Create an assistant first.');
    }

    const response = await getAssistantById(assistantId);
    console.log('Retrieve Response:', response);

    expect(response).toHaveProperty('id', assistantId);
    expect(response).toHaveProperty('name', examplePayload.name);
  });

  it('should update the assistant', async () => {
    if (!assistantId) {
      throw new Error('Assistant ID is not set. Create an assistant first.');
    }

    const updatePayload = {
      name: 'Updated Test Assistant',
      description: 'This is an updated description.',
    };

    const response = await updateAssistant(assistantId, updatePayload);
    console.log('Update Response:', response);

    expect(response).toBe(true);
  });

  it('should delete the assistant', async () => {
    if (!assistantId) {
      throw new Error('Assistant ID is not set. Create an assistant first.');
    }

    const response = await deleteAssistant(assistantId);
    console.log('Delete Response:', response);

    expect(response).toBe(true);
  });
});
