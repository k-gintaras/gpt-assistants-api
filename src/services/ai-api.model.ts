import { AssistantWithDetails } from '../models/assistant.model';
import { MemoryWithTags } from '../models/memory.model';
import { ConversationMessage } from './orchestrator-services/conversation/previous-conversation.service';

/**
 * Represents different categories of context data we want to inject:
 * - focusMemories: long-term knowledge or facts (may be instructions or data)
 * - conversationMessages: chat history (previous user/assistant messages)
 * - instructions: high-level system guidance or persona info
 * - userPrompt: current input from user
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export interface AiApiRequest {
  assistantData: AssistantWithDetails; // assistant data, we need to pass it to the api
  prompt: string;
  memories: MemoryWithTags[] | null; // extra memories
  conversationId: string | null;
  conversationMessages: ConversationMessage[] | null; // previous conversation messages (probably with owner type too)
}

export interface AiApiResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any;
  responseType: string; // text, image, sound, error, etc.
  conversationId: string | null; // chat id, if there is one (and if it is newly created)
  error: string | null; // if there is an error, it will be here
}

export interface AiApiContext {
  focusMemories: MemoryWithTags[];
  conversationMessages: ConversationMessage[];
  instructions: string; // assistant description, role, personality, etc.
  userPrompt: string;
  memoriesLimit: number; // clip extra for smaller models
  conversationLimit: number; // clip extra for smaller models
}

/**
 * Abstract base for AI API input builders.
 * Each subclass overrides to build input as API requires.
 */
export abstract class AiApiInputBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract buildInput(context: AiApiContext): any;
}
