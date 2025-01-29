import { MemoryFocusRule } from '../../models/focused-memory.model';

export interface MemoryFocusRuleServiceModel {
  createMemoryFocusRule(assistantId: string, maxResults: number, relationshipTypes: string[], priorityTags: string[]): Promise<MemoryFocusRule>;
  getMemoryFocusRules(assistantId: string): Promise<MemoryFocusRule | null>;
  updateMemoryFocusRule(id: string, updates: MemoryFocusRule): Promise<boolean>;
  removeMemoryFocusRule(id: string): Promise<boolean>;
}
