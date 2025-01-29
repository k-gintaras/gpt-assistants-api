import Database from 'better-sqlite3';
import { Assistant, AssistantRow, AssistantWithDetails } from '../../models/assistant.model';
import { AssistantServiceModel } from '../../models/service-models/assistant.service.model';
import { transformAssistantRow } from '../../transformers/assistant.transformer';
import { CreateAssistantService } from '../orchestrator-services/create-assistant.service';
import { DeleteAssistantService } from '../orchestrator-services/delete-assistant.service';
import { FullAssistantService } from '../sqlite-services/assistant-full.service';
import { AssistantService } from '../sqlite-services/assistant.service';
import { UpdateAssistantService } from '../orchestrator-services/updateAssistant.service';

export class AssistantControllerService implements AssistantServiceModel {
  assistantService: AssistantService;
  assistantFullService: FullAssistantService;
  createAssistantService: CreateAssistantService;
  updateAssistantService: UpdateAssistantService;
  deleteAssistantService: DeleteAssistantService;
  constructor(db: Database.Database) {
    this.assistantService = new AssistantService(db);
    this.assistantFullService = new FullAssistantService(db);
    this.createAssistantService = new CreateAssistantService(db);
    this.updateAssistantService = new UpdateAssistantService(db);
    this.deleteAssistantService = new DeleteAssistantService(db);
  }

  getAllAssistants(): Assistant[] | null {
    const assistantRows: AssistantRow[] | null = this.assistantService.getAllAssistants();

    if (!assistantRows) return null;
    const assistants: Assistant[] = assistantRows.map((a) => transformAssistantRow(a));
    return assistants;
  }

  getAssistantById(id: string): Assistant | null {
    const assistantRow: AssistantRow | null = this.assistantService.getAssistantById(id);
    if (!assistantRow) return null;
    const assistant: Assistant = transformAssistantRow(assistantRow);
    return assistant;
  }

  async getAssistantWithDetailsById(id: string): Promise<AssistantWithDetails | null> {
    const assistantWithDetails: AssistantWithDetails | null = await this.assistantFullService.getFullAssistantWithDetailsEfficient(id);
    return assistantWithDetails || null;
  }

  createAssistantSimple(name: string, type: string): Promise<string | null> {
    return this.createAssistantService.createSimpleAssistant(name, type);
  }

  createAssistant(name: string, type: Assistant['type'], model: string, instructions: string): Promise<string | null> {
    return this.createAssistantService.createAssistant(name, type, model, instructions);
  }

  updateAssistant(id: string, assistant: Assistant): Promise<boolean> {
    return this.updateAssistantService.updateAssistant(id, assistant);
  }

  deleteAssistant(id: string): Promise<boolean> {
    return this.deleteAssistantService.deleteAssistant(id);
  }
}
