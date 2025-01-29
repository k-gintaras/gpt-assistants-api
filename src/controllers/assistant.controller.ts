// controllers/assistant.controller.ts

import { Request, Response } from 'express';
import { AssistantControllerService } from '../services/core-services/assistant.controller.service';
import { respond } from './controller.helper';
import Database from 'better-sqlite3';

export class AssistantController {
  private readonly assistantService: AssistantControllerService;

  constructor(db: Database.Database) {
    this.assistantService = new AssistantControllerService(db);
  }

  async getAllAssistants(req: Request, res: Response) {
    try {
      const assistantRows = await this.assistantService.getAllAssistants();
      if (assistantRows?.length === 0) {
        return respond(res, 404, 'No assistants found.');
      }
      return respond(res, 200, 'Assistants fetched successfully', assistantRows);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve assistants.', null, error);
    }
  }

  async getAssistantById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const assistantRow = await this.assistantService.getAssistantById(id);
      if (!assistantRow) {
        return respond(res, 404, `Assistant with ID ${id} not found.`);
      }
      return respond(res, 200, `Assistant with ID ${id} fetched successfully`, assistantRow);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve assistant.', null, error);
    }
  }

  async getAssistantWithDetailsById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const assistantRow = await this.assistantService.getAssistantWithDetailsById(id);
      if (!assistantRow) {
        return respond(res, 404, `Full Assistant with ID ${id} not found.`);
      }
      return respond(res, 200, `Full Assistant with ID ${id} fetched successfully`, assistantRow);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve Full assistant.', null, error);
    }
  }

  async createAssistantSimple(req: Request, res: Response) {
    const { name, type } = req.body;
    try {
      const isCreated = await this.assistantService.createAssistantSimple(name, type);
      if (!isCreated) {
        return respond(res, 400, 'Failed to create assistant.');
      }
      return respond(res, 201, 'Assistant created successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to create assistant.', null, error);
    }
  }

  async createAssistant(req: Request, res: Response) {
    const { name, type, model, instructions } = req.body;
    try {
      const assistantId = await this.assistantService.createAssistant(name, type, model, instructions);
      if (!assistantId) {
        return respond(res, 400, 'Failed to create assistant.');
      }
      return respond(res, 201, 'Assistant created successfully.', { id: assistantId });
    } catch (error) {
      return respond(res, 500, 'Failed to create assistant.', null, error);
    }
  }

  async updateAssistant(req: Request, res: Response) {
    const { id } = req.params;
    const assistant = req.body;
    try {
      const isUpdated = await this.assistantService.updateAssistant(id, assistant);
      if (!isUpdated) {
        return respond(res, 404, `Assistant with ID ${id} not found or update failed.`);
      }
      return respond(res, 200, 'Assistant updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update assistant.', null, error);
    }
  }

  async deleteAssistant(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const isDeleted = await this.assistantService.deleteAssistant(id);
      if (!isDeleted) {
        return respond(res, 404, `Assistant with ID ${id} not found or delete failed.`);
      }
      return respond(res, 200, 'Assistant deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete assistant.', null, error);
    }
  }
}
