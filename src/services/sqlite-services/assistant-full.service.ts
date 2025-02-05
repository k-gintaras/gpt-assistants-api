import { Pool } from 'pg';
import { AssistantWithDetails, AssistantRow, FeedbackSummaryRow } from '../../models/assistant.model';
import { MemoryFocusRuleRow } from '../../models/focused-memory.model';
import { MemoryRow } from '../../models/memory.model';
import { Tag, TagRow } from '../../models/tag.model';
import { GET_FULL_ASSISTANT_WITH_DETAILS } from '../../queries/assistant.queries';
import { FullAssistantRows, transformFullAssistantResult } from '../../transformers/assistant-full.transformer';
import { transformAssistantWithDetails } from '../../transformers/assistant.transformer';

export class FullAssistantService {
  constructor(private pool: Pool) {}

  async getFullAssistantWithDetails(id: string): Promise<AssistantWithDetails | null> {
    const client = await this.pool.connect();
    try {
      // Fetching assistant details
      const assistantRow = await client.query<AssistantRow>(`SELECT * FROM assistants WHERE id = $1`, [id]).then((res) => res.rows[0]);

      if (!assistantRow) {
        return null;
      }

      // Fetching assistant tags
      const assistantTagRows = await client.query<TagRow>(`SELECT t.* FROM assistant_tags at JOIN tags t ON at.tag_id = t.id WHERE at.assistant_id = $1`, [id]).then((res) => res.rows);

      // Fetching memory focus rule
      const memoryFocusRuleRow = await client.query<MemoryFocusRuleRow>(`SELECT * FROM memory_focus_rules WHERE assistant_id = $1`, [id]).then((res) => res.rows[0]);

      // Fetching memories if focus rule exists
      const memoryRows = memoryFocusRuleRow
        ? await client
            .query<MemoryRow & { tag_id: string | null; tag_name: string | null }>(
              `SELECT m.*, t.id AS tag_id, t.name AS tag_name FROM focused_memories fm JOIN memories m ON fm.memory_id = m.id LEFT JOIN memory_tags mt ON m.id = mt.memory_id LEFT JOIN tags t ON mt.tag_id = t.id WHERE fm.memory_focus_id = $1`,
              [memoryFocusRuleRow.id]
            )
            .then((res) => res.rows)
        : [];

      const memoryTags: Record<string, Tag[]> = {}; // Ensure this is the correct Tag type
      memoryRows.forEach((row) => {
        if (!memoryTags[row.id]) {
          memoryTags[row.id] = [];
        }
        if (row.tag_id && row.tag_name) {
          memoryTags[row.id].push({ id: row.tag_id, name: row.tag_name });
        }
      });

      // Fetching feedback summary for both tasks and direct assistant feedback
      const feedbackSummaryRow = await client
        .query<FeedbackSummaryRow>(
          `SELECT 
      COALESCE(AVG(f.rating), 0) AS avg_rating, 
      COALESCE(COUNT(f.id), 0) AS total_feedback 
     FROM feedback f
     LEFT JOIN tasks t ON f.target_id = t.id AND f.target_type = 'task'
     WHERE (t.assigned_assistant = $1 OR f.target_type = 'assistant' AND f.target_id = $1)`,
          [id]
        )
        .then((res) => res.rows[0]);

      // Transform and return result
      return transformAssistantWithDetails(assistantRow, memoryRows, memoryTags, assistantTagRows, memoryFocusRuleRow, feedbackSummaryRow);
    } catch {
      throw new Error('Failed to fetch assistant details.');
    } finally {
      client.release();
    }
  }

  async getFullAssistantWithDetailsEfficient(id: string): Promise<AssistantWithDetails | null> {
    const client = await this.pool.connect();
    try {
      const rows: FullAssistantRows[] = await client.query(GET_FULL_ASSISTANT_WITH_DETAILS, [id]).then((res) => res.rows);
      if (rows.length === 0) return null;
      return transformFullAssistantResult(rows);
    } catch {
      throw new Error('Failed to fetch assistant details efficiently.');
    } finally {
      client.release();
    }
  }
}
