import Database from 'better-sqlite3';
import { MemoryFocusRule } from '../../models/focused-memory.model';
import { MemoryFocusRuleService } from '../sqlite-services/memory-focus-rule.service';
import { MemoryFocusRuleServiceModel } from '../../models/service-models/memory-focus-rule.service.model';

export class MemoryFocusRuleControllerService implements MemoryFocusRuleServiceModel {
  memoryFocusRuleService: MemoryFocusRuleService;

  constructor(db: Database.Database) {
    this.memoryFocusRuleService = new MemoryFocusRuleService(db);
  }

  createMemoryFocusRule(assistantId: string, maxResults: number, relationshipTypes: string[], priorityTags: string[]): Promise<MemoryFocusRule> {
    return this.memoryFocusRuleService.createMemoryFocusRule(assistantId, maxResults, relationshipTypes, priorityTags);
  }

  getMemoryFocusRules(assistantId: string): Promise<MemoryFocusRule | null> {
    return this.memoryFocusRuleService.getMemoryFocusRules(assistantId);
  }

  updateMemoryFocusRule(id: string, updates: MemoryFocusRule): Promise<boolean> {
    return this.memoryFocusRuleService.updateMemoryFocusRule(id, updates);
  }

  removeMemoryFocusRule(id: string): Promise<boolean> {
    return this.memoryFocusRuleService.removeMemoryFocusRule(id);
  }
}
