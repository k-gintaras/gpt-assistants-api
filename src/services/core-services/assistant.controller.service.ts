import { Pool } from 'pg';
import { Assistant, AssistantRow, AssistantWithDetails } from '../../models/assistant.model';
import { AssistantServiceModel } from '../../models/service-models/assistant.service.model';
import { transformAssistantRow } from '../../transformers/assistant.transformer';
import { CreateAssistantService } from '../orchestrator-services/create-assistant.service';
import { DeleteAssistantService } from '../orchestrator-services/delete-assistant.service';
import { UpdateAssistantService } from '../orchestrator-services/updateAssistant.service';
import { AssistantService } from '../sqlite-services/assistant.service';
import { FullAssistantService } from '../sqlite-services/assistant-full.service';

export class AssistantControllerService implements AssistantServiceModel {
  assistantService: AssistantService;
  assistantFullService: FullAssistantService;
  createAssistantService: CreateAssistantService;
  updateAssistantService: UpdateAssistantService;
  deleteAssistantService: DeleteAssistantService;

  constructor(pool: Pool) {
    this.assistantService = new AssistantService(pool);
    this.assistantFullService = new FullAssistantService(pool);
    this.createAssistantService = new CreateAssistantService(pool);
    this.updateAssistantService = new UpdateAssistantService(pool);
    this.deleteAssistantService = new DeleteAssistantService(pool);
  }

  async getAllAssistants(): Promise<Assistant[] | null> {
    const assistantRows: AssistantRow[] | null = await this.assistantService.getAllAssistants();

    if (!assistantRows) return null;
    const assistants: Assistant[] = assistantRows.map((a) => transformAssistantRow(a));
    return assistants;
  }

  async getAssistantById(id: string): Promise<Assistant | null> {
    const assistantRow: AssistantRow | null = await this.assistantService.getAssistantById(id);
    if (!assistantRow) return null;
    const assistant: Assistant = transformAssistantRow(assistantRow);
    return assistant;
  }

  async getAssistantWithDetailsById(id: string): Promise<AssistantWithDetails | null> {
    const assistantWithDetails: AssistantWithDetails | null = await this.assistantFullService.getFullAssistantWithDetailsEfficient(id);
    return assistantWithDetails || null;
  }

  async createAssistantSimple(name: string, instructions: string): Promise<string | null> {
    return this.createAssistantService.createSimpleAssistant(name, instructions);
  }

  async createAssistant(name: string, type: Assistant['type'], model: string, instructions: string): Promise<string | null> {
    return this.createAssistantService.createAssistant(name, type, model, instructions);
  }

  async updateAssistant(id: string, assistant: Assistant): Promise<boolean> {
    return this.updateAssistantService.updateAssistant(id, assistant);
  }

  async deleteAssistant(id: string): Promise<boolean> {
    return this.deleteAssistantService.deleteAssistant(id);
  }
}
