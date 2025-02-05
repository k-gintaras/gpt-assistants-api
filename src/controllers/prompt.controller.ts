import { Request, Response } from 'express';
import { Pool } from 'pg';
import { PromptControllerService } from '../services/core-services/prompt.controller.service';
import { respond } from './controller.helper';

export class PromptController {
  private readonly promptControllerService: PromptControllerService;

  constructor(db: Pool) {
    this.promptControllerService = new PromptControllerService(db);
  }

  /**
   * Process a prompt for a specific assistant.
   * @requestBody { id: string, prompt: string, extraInstruction?: string } The ID of the assistant, the prompt, and optional extra instructions.
   * @response {200} { status: "success", message: "Prompt processed successfully", data: any }
   * @response {400} { status: "error", message: "Prompt failed or assistant not found." }
   * @response {500} { status: "error", message: "Failed to process prompt.", error: any }
   */
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
