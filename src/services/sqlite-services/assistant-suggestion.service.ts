import Database from 'better-sqlite3';
import { TaskRequest } from '../../models/service-models/orchestrator.service.model';
import { AssistantSuggestion } from '../../models/service-models/orchestrator.service.model';

export class AssistantSuggestionService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  async suggestAssistants(task: TaskRequest, tags?: string[]): Promise<AssistantSuggestion[]> {
    // Format search pattern and ensure tags list is valid
    const taskDescription = `%${task.description}%`;
    const tagList = tags && tags.length ? tags : [];
    // Create placeholders for optional tag conditions
    const tagPlaceholders = tagList.map(() => '?').join(', ');
    const tagCondition = tagList.length ? `OR t.name IN (${tagPlaceholders})` : '';

    // Build query using CTEs for clarity and robustness
    const query = `
    WITH relevant_memories AS (
      SELECT DISTINCT m.id
      FROM memories m
      LEFT JOIN memory_tags mt ON m.id = mt.memory_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE m.description LIKE ? ${tagCondition}
    ),
    assistant_ranking AS (
      SELECT a.id AS assistant_id,
             COUNT(DISTINCT fm.memory_id) AS memory_match_count
      FROM assistants a
      LEFT JOIN owned_memories om ON a.id = om.assistant_id
      LEFT JOIN focused_memories fm ON fm.memory_id = om.memory_id
      LEFT JOIN relevant_memories rm ON fm.memory_id = rm.id
      LEFT JOIN assistant_tags at ON a.id = at.assistant_id
      LEFT JOIN tags t ON at.tag_id = t.id
      -- Check for a memory match or matching tag if provided
      WHERE rm.id IS NOT NULL ${tagList.length ? `OR t.name IN (${tagPlaceholders})` : ''}
      GROUP BY a.id
    ),
    final_ranking AS (
      SELECT ar.assistant_id,
             ar.memory_match_count,
             COALESCE(AVG(f.rating), 0) AS avg_feedback
      FROM assistant_ranking ar
      LEFT JOIN feedback f ON f.target_id = ar.assistant_id AND f.target_type = 'assistant'
      GROUP BY ar.assistant_id
    )
    SELECT assistant_id,
           (memory_match_count + avg_feedback) AS score
    FROM final_ranking
    ORDER BY score DESC
    LIMIT 5;
  `;
    // Construct parameters: first for task description, then for tags (twice if provided)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let params: any[] = [taskDescription];
    if (tagList.length) {
      params = params.concat(tagList);
    }
    if (tagList.length) {
      params = params.concat(tagList);
    }

    const stmt = this.db.prepare(query);
    const results = stmt.all(...params) as {
      assistant_id: string;
      score: number;
    }[];

    return results.map((row) => ({
      assistantId: row.assistant_id,
      score: row.score,
    }));
  }
}
