import { Request, Response } from 'express';
import { AssistantControllerService } from '../services/core-services/assistant.controller.service';
import { respond } from './controller.helper';
import { Pool } from 'pg';

export class AssistantController {
  private readonly assistantService: AssistantControllerService;

  constructor(db: Pool) {
    this.assistantService = new AssistantControllerService(db);
  }

  /**
   * Retrieve all assistants.
   * @response {200} { status: "success", message: "Assistants fetched successfully", data: Assistant[] }
   * @response {404} { status: "error", message: "No assistants found." }
   * @response {500} { status: "error", message: "Failed to retrieve assistants.", error: any }
   */
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

  /**
   * Retrieve an assistant by ID.
   * @requestParams { id: string } The ID of the assistant.
   * @response {200} { status: "success", message: "Assistant fetched successfully", data: Assistant }
   * @response {404} { status: "error", message: "Assistant not found." }
   * @response {500} { status: "error", message: "Failed to retrieve assistant.", error: any }
   */
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

  /**
   * Retrieve an assistant with details by ID.
   * @requestParams { id: string } The ID of the assistant.
   * @response {200} { status: "success", message: "Full assistant fetched successfully", data: AssistantDetails }
   * @response {404} { status: "error", message: "Full assistant not found." }
   * @response {500} { status: "error", message: "Failed to retrieve assistant details.", error: any }
   */
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

  /**
   * Create a simple assistant entry.
   * @requestBody { name: string, instructions: string } The name and instructions of the assistant.
   * @response {201} { status: "success", message: "Assistant created successfully", data: { id: string } }
   * @response {400} { status: "error", message: "Failed to create assistant." }
   * @response {500} { status: "error", message: "Failed to create assistant.", error: any }
   */
  async createAssistantSimple(req: Request, res: Response) {
    const { name, instructions } = req.body;
    try {
      const id = await this.assistantService.createAssistantSimple(name, instructions);
      if (!id) {
        return respond(res, 400, 'Failed to create assistant.');
      }
      return respond(res, 201, 'Assistant created successfully.', id);
    } catch (error) {
      return respond(res, 500, 'Failed to create assistant.', null, error);
    }
  }

  /**
   * Create a new assistant with full details.
   * @requestBody { name: string, description: string, type: string, model: string, instructions: string } The full assistant details.
   * @response {201} { status: "success", message: "Assistant created successfully", data: { id: string } }
   * @response {400} { status: "error", message: "Failed to create assistant." }
   * @response {500} { status: "error", message: "Failed to create assistant.", error: any }
   */
  async createAssistant(req: Request, res: Response) {
    const { name, description, type, model, instructions } = req.body;
    try {
      const assistantId = await this.assistantService.createAssistant(name, description, type, model, instructions);
      if (!assistantId) {
        return respond(res, 400, 'Failed to create assistant.');
      }
      return respond(res, 201, 'Assistant created successfully.', { id: assistantId });
    } catch (error) {
      return respond(res, 500, 'Failed to create assistant.', null, error);
    }
  }

  /**
   * Update an existing assistant.
   * @requestParams { id: string } The assistant's ID.
   * @requestBody { name?: string, type?: string, model?: string, instructions?: string } The fields to update.
   * @response {200} { status: "success", message: "Assistant updated successfully" }
   * @response {404} { status: "error", message: "Assistant not found." }
   * @response {500} { status: "error", message: "Failed to update assistant.", error: any }
   */
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

  /**
   * Delete an assistant.
   * @requestParams { id: string } The assistant's ID.
   * @response {200} { status: "success", message: "Assistant deleted successfully" }
   * @response {404} { status: "error", message: "Assistant not found." }
   * @response {500} { status: "error", message: "Failed to delete assistant.", error: any }
   */
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
