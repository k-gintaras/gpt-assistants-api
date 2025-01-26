import { AssistantTool } from 'openai/resources/beta/assistants';
import { AssistantResponseFormatOption } from 'openai/resources/beta/threads/threads';

// Define the structure for an Assistant
export interface GptAssistantResponse {
  id: string;
  name?: string;
  description?: string;
  instructions?: string;
  tools?: { type: string }[];
  metadata?: Record<string, string>;
  temperature?: number;
  top_p?: number;
}

export interface GptAssistantCreateRequest {
  model: string;
  instructions?: string;
  name?: string;
  description?: string;
  tools?: AssistantTool[];
  metadata?: Record<string, string>;
  temperature?: number;
  top_p?: number;
  response_format?: AssistantResponseFormatOption | null | undefined;
}
