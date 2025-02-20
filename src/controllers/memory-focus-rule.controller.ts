import { Pool } from 'pg';
import { Request, Response } from 'express';
import { MemoryFocusRuleControllerService } from '../services/core-services/memory-focus-rule.controller.service';
import { MemoryFocusRule } from '../models/focused-memory.model';
import { respond } from './controller.helper';

export class MemoryFocusRuleController {
  private readonly memoryFocusRuleService: MemoryFocusRuleControllerService;

  constructor(db: Pool) {
    this.memoryFocusRuleService = new MemoryFocusRuleControllerService(db);
  }

  /**
   * Create a memory focus rule.
   * @requestBody { assistantId: string, maxResults: number, relationshipTypes: string[], priorityTags: string[] } The memory focus rule details.
   * @response {201} { status: "success", message: "Memory focus rule created successfully", data: MemoryFocusRule }
   * @response {500} { status: "error", message: "Failed to create memory focus rule.", error: any }
   */
  async createMemoryFocusRule(req: Request, res: Response) {
    const { assistantId, maxResults, relationshipTypes, priorityTags } = req.body;
    try {
      const memoryFocusRule = await this.memoryFocusRuleService.createMemoryFocusRule(assistantId, maxResults, relationshipTypes, priorityTags);
      return respond(res, 201, 'Memory focus rule created successfully', memoryFocusRule);
    } catch (error) {
      return respond(res, 500, 'Failed to create memory focus rule.', null, error);
    }
  }

  /**
   * Retrieve memory focus rules for a specific assistant.
   * @requestParams { assistantId: string } The ID of the assistant.
   * @response {200} { status: "success", message: "Memory focus rule fetched successfully", data: MemoryFocusRule }
   * @response {404} { status: "error", message: "Memory focus rule for assistant with ID {assistantId} not found." }
   * @response {500} { status: "error", message: "Failed to retrieve memory focus rule.", error: any }
   */
  async getMemoryFocusRules(req: Request, res: Response) {
    const { assistantId } = req.params;

    try {
      const memoryFocusRule = await this.memoryFocusRuleService.getMemoryFocusRules(assistantId);
      if (!memoryFocusRule) {
        return respond(res, 404, `Memory focus rule for assistant with ID ${assistantId} not found.`);
      }
      return respond(res, 200, 'Memory focus rule fetched successfully', memoryFocusRule);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memory focus rule.', null, error);
    }
  }

  /**
   * Retrieve memory focus rules by id.
   * @requestParams { ruleId: string } The ID of the rule.
   * @response {200} { status: "success", message: "Memory focus rule fetched successfully", data: MemoryFocusRule }
   * @response {404} { status: "error", message: "Memory focus rule with ID {ruleId} not found." }
   * @response {500} { status: "error", message: "Failed to retrieve memory focus rule.", error: any }
   */
  async getMemoryFocusRuleById(req: Request, res: Response) {
    const { ruleId } = req.params;

    try {
      const memoryFocusRule = await this.memoryFocusRuleService.getMemoryFocusRules(ruleId);
      if (!memoryFocusRule) {
        return respond(res, 404, `Memory focus rule with ID ${ruleId} not found.`);
      }
      return respond(res, 200, 'Memory focus rule fetched successfully', memoryFocusRule);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve memory focus rule.', null, error);
    }
  }

  /**
   * Update an existing memory focus rule.
   * @requestParams { id: string } The ID of the memory focus rule.
   * @requestBody { assistantId: string, maxResults: number, relationshipTypes: string[], priorityTags: string[] } The updated memory focus rule details.
   * @response {200} { status: "success", message: "Memory focus rule updated successfully" }
   * @response {404} { status: "error", message: "Memory focus rule with ID {id} not found or update failed." }
   * @response {500} { status: "error", message: "Failed to update memory focus rule.", error: any }
   */
  async updateMemoryFocusRule(req: Request, res: Response) {
    const { id } = req.params;
    const updates: MemoryFocusRule = req.body;

    try {
      const isUpdated = await this.memoryFocusRuleService.updateMemoryFocusRule(id, updates);
      if (!isUpdated) {
        return respond(res, 404, `Memory focus rule with ID ${id} not found or update failed.`);
      }
      return respond(res, 200, 'Memory focus rule updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update memory focus rule.', null, error);
    }
  }

  /**
   * Delete a memory focus rule.
   * @requestParams { id: string } The ID of the memory focus rule to delete.
   * @response {200} { status: "success", message: "Memory focus rule deleted successfully" }
   * @response {404} { status: "error", message: "Memory focus rule with ID {id} not found or delete failed." }
   * @response {500} { status: "error", message: "Failed to delete memory focus rule.", error: any }
   */
  async removeMemoryFocusRule(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const isDeleted = await this.memoryFocusRuleService.removeMemoryFocusRule(id);
      if (!isDeleted) {
        return respond(res, 404, `Memory focus rule with ID ${id} not found or delete failed.`);
      }
      return respond(res, 200, 'Memory focus rule deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete memory focus rule.', null, error);
    }
  }
}
