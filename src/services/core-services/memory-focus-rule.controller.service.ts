import { Pool } from 'pg';
import { MemoryFocusRule } from '../../models/focused-memory.model';
import { MemoryFocusRuleServiceModel } from '../../models/service-models/memory-focus-rule.service.model';
import { MemoryFocusRuleService } from '../sqlite-services/memory-focus-rule.service';

export class MemoryFocusRuleControllerService implements MemoryFocusRuleServiceModel {
  memoryFocusRuleService: MemoryFocusRuleService;

  constructor(pool: Pool) {
    this.memoryFocusRuleService = new MemoryFocusRuleService(pool);
  }

  async createMemoryFocusRule(assistantId: string, maxResults: number, relationshipTypes: string[], priorityTags: string[]): Promise<MemoryFocusRule> {
    return await this.memoryFocusRuleService.createMemoryFocusRule(assistantId, maxResults, relationshipTypes, priorityTags);
  }

  async getMemoryFocusRules(assistantId: string): Promise<MemoryFocusRule | null> {
    return await this.memoryFocusRuleService.getMemoryFocusRules(assistantId);
  }

  async updateMemoryFocusRule(id: string, updates: MemoryFocusRule): Promise<boolean> {
    return await this.memoryFocusRuleService.updateMemoryFocusRule(id, updates);
  }

  async removeMemoryFocusRule(id: string): Promise<boolean> {
    return await this.memoryFocusRuleService.removeMemoryFocusRule(id);
  }
}
