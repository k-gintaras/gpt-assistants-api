import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { MemoryFocusRuleControllerService } from '../services/core-services/memory-focus-rule.controller.service';
import { MemoryFocusRule } from '../models/focused-memory.model';
import { respond } from './controller.helper';

export class MemoryFocusRuleController {
  private readonly memoryFocusRuleService: MemoryFocusRuleControllerService;

  constructor(db: Database.Database) {
    this.memoryFocusRuleService = new MemoryFocusRuleControllerService(db);
  }
  async createMemoryFocusRule(req: Request, res: Response) {
    const { assistantId, maxResults, relationshipTypes, priorityTags } = req.body;

    try {
      const memoryFocusRule = await this.memoryFocusRuleService.createMemoryFocusRule(assistantId, maxResults, relationshipTypes, priorityTags);
      return respond(res, 201, 'Memory focus rule created successfully', memoryFocusRule);
    } catch (error) {
      return respond(res, 500, 'Failed to create memory focus rule.', null, error);
    }
  }

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
