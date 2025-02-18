import { Memory, MemoryWithTags } from '../models/memory.model';
import { INSTRUCTION_SEPARATOR } from './config.service';
import { GptMessageArray } from './gpt-api/gpt-api-chat-completion';
import { GptThreadMessageArray } from './gpt-api/gpt-api-thread';

export class MemoryTransformerService {
  /**
   * Transforms memory rows into GPT-compatible messages.
   * @param memories - Array of memory objects.
   * @param options - Options for filtering or formatting messages.
   * @returns Array of GPT-compatible messages.
   */
  getMessages(memories: Memory[], options: { includeTypes?: Memory['type'][]; maxMemories?: number } = {}): GptMessageArray {
    const { includeTypes, maxMemories } = options;

    // Filter memories by type if specified
    const filteredMemories = includeTypes ? memories.filter((memory) => includeTypes.includes(memory.type)) : memories;

    // Limit the number of memories if maxMemories is specified
    const limitedMemories = maxMemories ? filteredMemories.slice(0, maxMemories) : filteredMemories;

    // Transform memories into messages

    // TODO: ? is there point having other things in messages, as those are our GUIDES to behave certain way
    // ? do we store them different types in database?

    return limitedMemories.map((memory) => ({
      role: 'system',
      content: memory.description || JSON.stringify(memory.data) || '',
    }));
  }

  /**
   * Transforms memory rows into thread-compatible messages.
   * @param memories - Array of memory objects.
   * @param options - Options for filtering or formatting messages.
   * @returns Array of thread-compatible messages.
   */
  getThreadMessages(memories: Memory[], options: { includeTypes?: Memory['type'][]; maxMemories?: number } = {}): GptThreadMessageArray {
    const { includeTypes, maxMemories } = options;

    // Filter memories by type if specified
    const filteredMemories = includeTypes ? memories.filter((memory) => includeTypes.includes(memory.type)) : memories;

    // Limit the number of memories if maxMemories is specified
    const limitedMemories = maxMemories ? filteredMemories.slice(0, maxMemories) : filteredMemories;

    // Transform memories into thread-compatible messages
    return limitedMemories.map((memory) => {
      // Map memory types to thread-compatible roles
      // TODO: ? is there point having other things in messages, as those are our GUIDES to behave certain way
      // ? do we store them different types in database?
      //   const role: 'user' | 'assistant' = memory.type === 'instruction' || memory.type === 'prompt' ? 'assistant' : 'user';

      // if we use assistant, it will simply respond with the same thing, so we must use user
      const role = 'user';
      return {
        role,
        content: memory.description || JSON.stringify(memory.data) || '',
      };
    });
  }

  getMemoriesToInstructions(memory: MemoryWithTags[] | Memory[]): string {
    return memory
      .filter((m) => m.type === 'instruction')
      .map((m) => m.description)
      .join(INSTRUCTION_SEPARATOR);
  }
}
