import { Pool } from 'pg';
import { PromptService } from '../orchestrator-services/prompt.service';
import { PromptServiceModel } from '../../models/service-models/prompt.service.model';

export class PromptControllerService implements PromptServiceModel {
  private promptService: PromptService;

  constructor(pool: Pool) {
    this.promptService = new PromptService(pool);
  }

  async prompt(id: string, prompt: string, extraInstruction?: string): Promise<string | null> {
    return await this.promptService.prompt(id, prompt, extraInstruction);
  }
}
