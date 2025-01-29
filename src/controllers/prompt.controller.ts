import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import { PromptControllerService } from '../services/core-services/prompt.controller.service';
import { respond } from './controller.helper';

export class PromptController {
  private readonly promptControllerService: PromptControllerService;

  constructor(db: Database.Database) {
    this.promptControllerService = new PromptControllerService(db);
  }

  async prompt(req: Request, res: Response) {
    const { id, prompt, extraInstruction } = req.body;

    try {
      const result = await this.promptControllerService.prompt(id, prompt, extraInstruction);
      if (result === null) {
        return respond(res, 400, 'Prompt failed or assistant not found.');
      }
      return respond(res, 200, 'Prompt processed successfully', result);
    } catch (error) {
      return respond(res, 500, 'Failed to process prompt.', null, error);
    }
  }
}
