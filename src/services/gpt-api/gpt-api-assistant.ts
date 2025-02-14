import { Assistant, AssistantCreateParams, AssistantDeleted } from 'openai/resources/beta/assistants';
import { getOpenAI } from './gpt-api-connector';
import { GptAssistantCreateRequest } from './gpt-api-models.model';

export async function createGptAssistant(payload: GptAssistantCreateRequest): Promise<Assistant | null> {
  try {
    const openai = getOpenAI();

    // Dynamically build the request object
    const params: AssistantCreateParams = {
      model: payload.model, // Required
      ...(payload.instructions ? { instructions: payload.instructions } : {}),
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.tools && payload.tools.length > 0 ? { tools: payload.tools } : {}),
      ...(payload.metadata ? { metadata: payload.metadata } : {}),
      ...(payload.temperature !== undefined ? { temperature: payload.temperature } : {}),
      ...(payload.top_p !== undefined ? { top_p: payload.top_p } : {}),
      ...(payload.response_format ? { response_format: payload.response_format } : {}),
    };

    const myAssistant = await openai.beta.assistants.create(params);
    return myAssistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
    return null;
  }
}

// Function to retrieve an assistant by ID
export async function getAssistantById(id: string): Promise<Assistant | null> {
  try {
    const openai = getOpenAI();
    const response: Assistant = await openai.beta.assistants.retrieve(id);
    return response;
  } catch (err) {
    console.error('Error retrieving assistant:', err);
    return null;
  }
}

// Function to update an assistant
export async function updateAssistant(id: string, updates: Partial<GptAssistantCreateRequest>): Promise<boolean> {
  try {
    const openai = getOpenAI();
    const response: Assistant = await openai.beta.assistants.update(id, updates);
    if (response) return true;
  } catch (err) {
    console.error('Error updating assistant:', err);
  }
  return false;
}

// Function to delete an assistant
export async function deleteAssistant(id: string): Promise<boolean> {
  try {
    const openai = getOpenAI();
    const response: AssistantDeleted = await openai.beta.assistants.del(id);
    if (response?.deleted) return true;
  } catch (err) {
    console.error('Error deleting assistant:', err);
  }
  return false;
}
