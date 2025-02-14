import { getOpenAI } from '../../../services/gpt-api/gpt-api-connector';
import { GptAssistantCreateRequest } from '../../../services/gpt-api/gpt-api-models.model';
import { getAssistantById, updateAssistant, deleteAssistant, createGptAssistant } from '../../../services/gpt-api/gpt-api-assistant';

jest.mock('../../../services/gpt-api/gpt-api-connector', () => ({
  getOpenAI: jest.fn(),
}));

describe('Assistant API Tests', () => {
  const mockOpenAI = {
    beta: {
      assistants: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        del: jest.fn(),
      },
    },
  };

  beforeAll(() => {
    (getOpenAI as jest.Mock).mockReturnValue(mockOpenAI);
  });

  const examplePayload: GptAssistantCreateRequest = {
    model: 'gpt-4o',
    instructions: 'You are a helpful assistant.',
    name: 'Test Assistant',
    description: 'This is a test assistant.',
    tools: [{ type: 'code_interpreter' }],
    metadata: { category: 'testing' },
    temperature: 0.7,
    top_p: 0.9,
    response_format: 'auto',
  };

  let createdAssistantId: string;

  it('should create an assistant', async () => {
    mockOpenAI.beta.assistants.create.mockResolvedValue({
      id: 'asst_123',
      model: examplePayload.model,
      instructions: examplePayload.instructions,
      name: examplePayload.name,
      description: examplePayload.description,
      tools: examplePayload.tools,
      metadata: examplePayload.metadata,
      temperature: examplePayload.temperature,
      top_p: examplePayload.top_p,
    });

    const response = await createGptAssistant(examplePayload);
    if (!response) return;
    createdAssistantId = response.id;

    expect(mockOpenAI.beta.assistants.create).toHaveBeenCalledWith(expect.objectContaining(examplePayload));
    expect(response.id).toBe('asst_123');
  });

  it('should retrieve an assistant by ID', async () => {
    mockOpenAI.beta.assistants.retrieve.mockResolvedValue({
      id: createdAssistantId,
      model: examplePayload.model,
      instructions: examplePayload.instructions,
      name: examplePayload.name,
      description: examplePayload.description,
      tools: examplePayload.tools,
      metadata: examplePayload.metadata,
      temperature: examplePayload.temperature,
      top_p: examplePayload.top_p,
    });

    const response = await getAssistantById(createdAssistantId);

    expect(mockOpenAI.beta.assistants.retrieve).toHaveBeenCalledWith(createdAssistantId);
    expect(response?.id).toBe(createdAssistantId);
  });

  it('should update an assistant', async () => {
    const updatePayload = { name: 'Updated Assistant' };
    mockOpenAI.beta.assistants.update.mockResolvedValue({
      ...examplePayload,
      id: createdAssistantId,
      name: updatePayload.name,
    });

    const result = await updateAssistant(createdAssistantId, updatePayload as GptAssistantCreateRequest);

    expect(mockOpenAI.beta.assistants.update).toHaveBeenCalledWith(createdAssistantId, expect.objectContaining(updatePayload));
    expect(result).toBe(true);
  });

  it('should delete an assistant', async () => {
    mockOpenAI.beta.assistants.del.mockResolvedValue({
      id: createdAssistantId,
      object: 'assistant.deleted',
      deleted: true,
    });

    const result = await deleteAssistant(createdAssistantId);

    expect(mockOpenAI.beta.assistants.del).toHaveBeenCalledWith(createdAssistantId);
    expect(result).toBe(true);
  });

  //   it('should handle errors gracefully', async () => {
  //     mockOpenAI.beta.assistants.create.mockRejectedValue(new Error('Failed to create assistant'));

  //     try {
  //       await createAssistant(examplePayload);
  //     } catch (err) {
  //       console.error('Create Error:', err);
  //       const e: Error = err as Error;
  //       const msg = e.message;
  //       expect(msg).toBe('Failed to create assistant');
  //     }
  //   });
});
