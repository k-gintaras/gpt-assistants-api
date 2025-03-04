import { Pool } from 'pg';
import { MemoryFocusRule } from '../../models/focused-memory.model';
import { Memory } from '../../models/memory.model';
import { MemoryRequest } from '../../models/service-models/orchestrator.service.model';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';
import { MemoryFocusRuleService } from '../sqlite-services/memory-focus-rule.service';
import { MemoryService } from '../sqlite-services/memory.service';
import { OwnedMemoryService } from '../sqlite-services/owned-memory.service';
import { TagExtraService } from '../sqlite-services/tag-extra.service';
import { TagService } from '../sqlite-services/tag.service';

export class RememberService {
  memoryService: MemoryService;
  ownedMemoryService: OwnedMemoryService;
  tagExtraService: TagExtraService;
  focusedMemoryService: FocusedMemoryService;
  tagService: TagService;
  memoryFocusRuleService: MemoryFocusRuleService;

  constructor(pool: Pool) {
    this.memoryService = new MemoryService(pool);
    this.ownedMemoryService = new OwnedMemoryService(pool);
    this.tagExtraService = new TagExtraService(pool);
    this.focusedMemoryService = new FocusedMemoryService(pool);
    this.tagService = new TagService(pool);
    this.memoryFocusRuleService = new MemoryFocusRuleService(pool);
  }

  async remember(assistantId: string, memory: MemoryRequest, tags?: string[], isFocused: boolean = false): Promise<boolean> {
    const memoryData: Memory = {
      id: '',
      type: memory.type,
      description: memory.text,
      data: null,
      createdAt: null,
      updatedAt: null,
      name: null,
      summary: null,
    };

    let memoryId;
    try {
      // Step 1: Add the memory
      memoryId = await this.memoryService.addMemory(memoryData);
      if (!memoryId) {
        console.error('Failed to create memory.');
        return false;
      }

      // Step 2: Link memory to assistant
      const linkedMemory = await this.ownedMemoryService.addOwnedMemory(assistantId, memoryId);
      if (!linkedMemory) {
        console.error('Failed to link memory to assistant.');
      }

      // Step 3: Optionally add memory to focused memories
      if (isFocused) {
        const focusRule: MemoryFocusRule | null = await this.memoryFocusRuleService.getMemoryFocusRules(assistantId);
        if (focusRule) {
          const focusedMemoryAdded = await this.focusedMemoryService.addFocusedMemory(focusRule.id, memoryId);
          if (!focusedMemoryAdded) {
            console.error('Failed to add focused memory.');
          }
        } else {
          console.error('No focus rule found for assistant.');
        }
      }

      // Step 4: Add tags if provided
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          try {
            const tagId = await this.tagService.ensureTagExists(tagName);
            const tagAdded = await this.tagExtraService.addTagToEntity(memoryId, tagId, 'memory');
            if (!tagAdded) {
              console.error(`Failed to add tag '${tagName}' to memory.`);
            }
          } catch (error) {
            console.error(`Error adding tag '${tagName}':`, error);
          }
        }
      }

      return true; // Return true if memory is successfully created, even if some operations failed
    } catch (error) {
      console.error('Error in remember:', error);
      return false; // Return false if memory creation failed
    }
  }
}
