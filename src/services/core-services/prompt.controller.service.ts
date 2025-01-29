import Database from 'better-sqlite3';
import { PromptService } from '../orchestrator-services/prompt.service';
import { PromptServiceModel } from '../../models/service-models/prompt.service.model';

export class PromptControllerService implements PromptServiceModel {
  private promptService: PromptService;

  constructor(db: Database.Database) {
    this.promptService = new PromptService(db);
  }

  async prompt(id: string, prompt: string, extraInstruction?: string): Promise<string | null> {
    return this.promptService.prompt(id, prompt, extraInstruction);
  }
}
