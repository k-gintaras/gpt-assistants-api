import { Route, Tags, Get, Post, Put, Delete, Path, Body, SuccessResponse, ValidateError } from 'tsoa';
import { AssistantControllerService } from '../services/core-services/assistant.controller.service';
import { getDb } from '../database/database';
import { Assistant, AssistantWithDetails } from '../models/assistant.model';

@Route('assistant')
@Tags('Assistant')
export class AssistantController {
  private assistantService: AssistantControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.assistantService = new AssistantControllerService(pool);
  }

  @Get('/')
  public async getAllAssistants(): Promise<Assistant[]> {
    const assistantRows = await this.assistantService.getAllAssistants();
    if (!assistantRows || assistantRows.length === 0) {
      throw new ValidateError({}, 'No assistants found.');
    }
    return assistantRows;
  }

  @Get('/{id}')
  public async getAssistantById(@Path() id: string): Promise<Assistant> {
    const assistantRow = await this.assistantService.getAssistantById(id);
    if (!assistantRow) throw new ValidateError({}, `Assistant with ID ${id} not found.`);
    return assistantRow;
  }

  @Get('/{id}/details')
  public async getAssistantWithDetailsById(@Path() id: string): Promise<AssistantWithDetails> {
    const assistantRow = await this.assistantService.getAssistantWithDetailsById(id);
    if (!assistantRow) throw new ValidateError({}, `Full Assistant with ID ${id} not found.`);
    return assistantRow;
  }

  @Post('/simple')
  @SuccessResponse('201', 'Created')
  public async createAssistantSimple(@Body() body: { name: string; instructions: string }): Promise<{ id: string }> {
    const id = await this.assistantService.createAssistantSimple(body.name, body.instructions);
    if (!id) throw new ValidateError({}, 'Failed to create assistant.');
    return { id };
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async createAssistant(@Body() body: { name: string; description: string; type: Assistant['type']; model: string; instructions: string }): Promise<{ id: string }> {
    const assistantId = await this.assistantService.createAssistant(body.name, body.description, body.type, body.model, body.instructions);
    if (!assistantId) throw new ValidateError({}, 'Failed to create assistant.');
    return { id: assistantId };
  }

  @Put('/{id}')
  public async updateAssistant(@Path() id: string, @Body() assistant: Partial<Assistant>): Promise<void> {
    const isUpdated = await this.assistantService.updateAssistant(id, assistant as Assistant);
    if (!isUpdated) throw new ValidateError({}, `Assistant with ID ${id} not found or update failed.`);
  }

  @Delete('/{id}')
  public async deleteAssistant(@Path() id: string): Promise<void> {
    const isDeleted = await this.assistantService.deleteAssistant(id);
    if (!isDeleted) throw new ValidateError({}, `Assistant with ID ${id} not found or delete failed.`);
  }
}
