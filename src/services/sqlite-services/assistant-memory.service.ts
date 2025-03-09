import { Pool } from 'pg';
import { Memory } from '../../models/memory.model';

export enum BrainRegion {
  FOCUSED = 'focused',
  OWNED = 'owned',
  RELATED = 'related',
}

export interface AssistantMemoryData {
  focused: Memory[];
  owned: Memory[];
  related: Memory[];
}

export class AssistantMemoryService {
  constructor(private pool: Pool) {}

  /**
   * Fetch all categorized memories for a given assistant.
   */
  async getAllAssistantMemories(assistantId: string): Promise<AssistantMemoryData> {
    try {
      const query = `
        WITH
          focused AS (
            SELECT m.*
            FROM focused_memories fm
            JOIN memories m ON fm.memory_id = m.id
            JOIN memory_focus_rules fr ON fm.memory_focus_id = fr.id
            WHERE fr.assistant_id = $1
          ),
          owned AS (
            SELECT m.*
            FROM owned_memories om
            JOIN memories m ON om.memory_id = m.id
            WHERE om.assistant_id = $1
          ),
          related AS (
            SELECT m.*
            FROM memories m
            JOIN memory_tags mt ON m.id = mt.memory_id
            JOIN tags t ON mt.tag_id = t.id
            WHERE t.name = (SELECT name FROM assistants WHERE id = $1)
          )
        SELECT 'focused' AS category, * FROM focused
        UNION ALL
        SELECT 'owned', * FROM owned
        UNION ALL
        SELECT 'related', * FROM related;
      `;

      const result = await this.pool.query(query, [assistantId]);

      // Organize results into categories
      const categorizedMemories: AssistantMemoryData = {
        focused: [],
        owned: [],
        related: [],
      };

      for (const row of result.rows) {
        const memory: Memory = {
          id: row.id,
          name: row.name || null,
          type: row.type,
          summary: row.summary || null,
          description: row.description || null,
          data: row.data || null,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };

        if (row.category === 'focused') {
          categorizedMemories.focused.push(memory);
        } else if (row.category === 'owned') {
          categorizedMemories.owned.push(memory);
        } else if (row.category === 'related') {
          categorizedMemories.related.push(memory);
        }
      }

      return categorizedMemories;
    } catch (error) {
      console.error('Error fetching assistant memories:', error);
      throw new Error('Failed to fetch assistant memories.');
    }
  }
}
