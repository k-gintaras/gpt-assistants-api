import { Route, Tags, Post, Body, ValidateError, Security } from 'tsoa';
import { PromptControllerService } from '../services/core-services/prompt.controller.service';
import { getDb } from '../database/database';

@Route('prompt')
@Tags('Prompt')
export class PromptController {
  private readonly promptControllerService: PromptControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.promptControllerService = new PromptControllerService(pool);
  }

  @Post('/')
  @Security('claims', ['canUseGpt'])
  public async prompt(@Body() body: { id: string; prompt: string; extraInstruction?: string }): Promise<string> {
    const result = await this.promptControllerService.promptWithDelay(body.id, body.prompt, body.extraInstruction);
    if (result === null) throw new ValidateError({}, 'Prompt failed or assistant not found.');
    return result;
  }
}
