import { GptAssistantCreateRequest } from '../../services/gpt-api/gpt-api-models.model';
import { Assistant, AssistantWithDetails } from '../assistant.model';

export interface AssistantServiceModel {
  getAllAssistants(): Promise<Assistant[] | null>;
  getAssistantById(id: string): Promise<Assistant | null>;
  getAssistantWithDetailsById(id: string): Promise<AssistantWithDetails | null>;
  createAssistantSimple(name: string, type: string): Promise<string | null>;
  createAssistant(name: string, description: string, type: string, model: string, instructions: string): Promise<string | null>;
  updateAssistant(id: string, updates: GptAssistantCreateRequest): Promise<boolean>;
  deleteAssistant(id: string): Promise<boolean>;
}
