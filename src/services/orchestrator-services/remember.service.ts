import Database from 'better-sqlite3';
import { MemoryRequest } from '../../models/service-models/orchestrator.service.model';
import { FocusedMemoryService } from '../sqlite-services/focused-memory.service';
import { MemoryService } from '../sqlite-services/memory.service';
import { OwnedMemoryService } from '../sqlite-services/owned-memory.service';
import { TagExtraService } from '../sqlite-services/tag-extra.service';
import { TagService } from '../sqlite-services/tag.service';

export class RememberService {
  memoryService: MemoryService;
  ownedMemoryService: OwnedMemoryService;
  tagExtraService: TagExtraService;
  focusedMemoryService: FocusedMemoryService; // Manages assistant's "focused" memories, which are actively used.
  tagService: TagService;

  constructor(db: Database.Database) {
    this.memoryService = new MemoryService(db); // Handles general memory storage
    this.ownedMemoryService = new OwnedMemoryService(db); // Links memories to assistants
    this.tagExtraService = new TagExtraService(db); // Manages memory tagging for categorization
    this.focusedMemoryService = new FocusedMemoryService(db); // Manages focused memories that assistants actively use
    this.tagService = new TagService(db); // Initialize tag service
  }

  /**
   * Stores a memory for an assistant and optionally marks it as a focused memory.
   *
   * @param assistantId - The ID of the assistant storing the memory.
   * @param memory - The memory object containing type and data.
   * @param tags - Optional tags to categorize the memory for better retrieval.
   * @param isFocused - Whether this memory should be a "focused memory" (actively used).
   *
   * @returns {Promise<boolean>} - Returns true if the memory was successfully stored and linked.
   */
  async remember(
    assistantId: string,
    memory: MemoryRequest,
    tags?: string[],
    isFocused: boolean = false // Controls whether the memory is actively used by the assistant.
  ): Promise<boolean> {
    try {
      // Step 1: Add memory to the `memories` table
      const memoryId = await this.memoryService.addMemory({
        type: memory.type,
        description: memory.data.substring(0, 50), // Truncate description for brevity
        data: memory.data,
      });

      if (!memoryId) {
        throw new Error('Failed to create memory.');
      }

      // Step 2: Link memory to the assistant in the `owned_memories` table (assistant "owns" this memory)
      const linkedMemory = await this.ownedMemoryService.addOwnedMemory(assistantId, memoryId);
      if (!linkedMemory) {
        throw new Error('Failed to link memory to assistant.');
      }

      // Step 3: If memory is marked as "focused," add it to `focused_memories` so it's actively used.
      if (isFocused) {
        const focusedMemoryAdded = await this.focusedMemoryService.addFocusedMemory(assistantId, memoryId);
        if (!focusedMemoryAdded) {
          throw new Error('Failed to add memory to focused memories.');
        }
      }

      // Step 4: Add tags to the `memory_tags` table (for easy retrieval based on category)
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const tagId = await this.tagService.ensureTagExists(tagName); // Fetch or create tag ID
          const tagAdded = await this.tagExtraService.addTagToEntity(memoryId, tagId, 'memory');
          if (!tagAdded) {
            throw new Error(`Failed to add tag '${tagName}' to memory.`);
          }
        }
      }

      return true; // Successfully stored, linked, and optionally focused the memory.
    } catch (error) {
      console.error('Error in remember:', error);
      throw error;
    }
  }
}
