import { AssistantWithDetails, AssistantRow, FeedbackSummaryRow } from '../models/assistant.model';
import { MemoryRow } from '../models/memory.model';
import { MemoryFocusRuleRow } from '../models/focused-memory.model';
import { GET_FULL_ASSISTANT_WITH_DETAILS } from '../queries/assistant.queries';
import { FullAssistantRows, transformFullAssistantResult } from '../transformers/assistant-full.transformer';
import { transformAssistantWithDetails } from '../transformers/assistant.transformer';
import { TagRow, Tag } from '../models/tag.model';
import Database from 'better-sqlite3';

export const fullAssistantService = {
  db: new Database(':memory:'), // Default database instance

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  },
  /**
   * Fetch full assistant details using individual queries.
   */
  async getFullAssistantWithDetails(id: string): Promise<AssistantWithDetails | null> {
    try {
      // Fetch assistant details
      const assistantRow = this.db
        .prepare(
          `
      SELECT * 
      FROM assistants 
      WHERE id = ?
    `
        )
        .get(id) as AssistantRow | undefined;

      if (!assistantRow) return null;

      // Fetch assistant tags
      const assistantTagRows = this.db
        .prepare(
          `
      SELECT t.* 
      FROM assistant_tags at
      JOIN tags t ON at.tag_id = t.id
      WHERE at.assistant_id = ?
    `
        )
        .all(id) as TagRow[];

      // Fetch memory focus rule
      const memoryFocusRuleRow = this.db
        .prepare(
          `
      SELECT * 
      FROM memory_focus_rules 
      WHERE assistant_id = ?
    `
        )
        .get(id) as MemoryFocusRuleRow | undefined;

      // Fetch related focused memories if a focus rule exists
      const memoryRows = memoryFocusRuleRow
        ? (this.db
            .prepare(
              `
          SELECT m.*, t.id AS tag_id, t.name AS tag_name
          FROM focused_memories fm
          JOIN memories m ON fm.memory_id = m.id
          LEFT JOIN memory_tags mt ON m.id = mt.memory_id
          LEFT JOIN tags t ON mt.tag_id = t.id
          WHERE fm.memory_focus_id = ?
        `
            )
            .all(memoryFocusRuleRow.id) as (MemoryRow & { tag_id: string | null; tag_name: string | null })[])
        : [];

      // Group tags by memory ID
      const memoryTags: Record<string, Tag[]> = {};
      memoryRows.forEach((row) => {
        if (!memoryTags[row.id]) {
          memoryTags[row.id] = [];
        }
        if (row.tag_id && row.tag_name) {
          memoryTags[row.id].push({ id: row.tag_id, name: row.tag_name });
        }
      });

      // Fetch feedback summary for the assistant
      const feedbackSummaryRow = this.db
        .prepare(
          `
      SELECT 
        COALESCE(AVG(f.rating), 0) AS avgRating, 
        COALESCE(COUNT(f.id), 0) AS totalFeedback
      FROM feedback f
      JOIN tasks t ON f.target_id = t.id AND f.target_type = 'task'
      WHERE t.assignedAssistant = ?
    `
        )
        .get(id) as FeedbackSummaryRow;

      // Transform and return the AssistantWithDetails object
      return transformAssistantWithDetails(assistantRow, memoryRows, memoryTags, assistantTagRows, memoryFocusRuleRow, feedbackSummaryRow);
    } catch (error) {
      console.error('Error fetching full assistant details:', error);
      throw new Error('Failed to fetch assistant details.');
    }
  },

  /**
   * Fetch full assistant details using an efficient single query.
   */
  async getFullAssistantWithDetailsEfficient(id: string): Promise<AssistantWithDetails | null> {
    try {
      const rows = this.db.prepare(GET_FULL_ASSISTANT_WITH_DETAILS).all(id) as FullAssistantRows[];
      if (rows.length === 0) return null;

      return transformFullAssistantResult(rows);
    } catch (error) {
      console.error('Error transforming full assistant details:', error);
      throw new Error('Failed to fetch assistant details efficiently.');
    }
  },
};
