import { Pool } from 'pg';
import { TaskRequest } from '../../models/service-models/orchestrator.service.model';
import { AssistantSuggestion } from '../../models/service-models/orchestrator.service.model';

export class AssistantSuggestionService {
  constructor(private pool: Pool) {}

  async suggestAssistants(task: TaskRequest, tags?: string[]): Promise<AssistantSuggestion[]> {
    const taskDescription = `%${task.description}%`;
    const tagList = tags && tags.length ? tags : [];
    // Define two sets of placeholders for separate tag conditions.
    const tagPlaceholders1 = tagList.map((_, i) => `$${i + 2}`).join(', ');
    const tagPlaceholders2 = tagList.map((_, i) => `$${i + 2 + tagList.length}`).join(', ');

    const query = `
WITH relevant_memories AS (
  SELECT DISTINCT m.id
  FROM memories m
  LEFT JOIN memory_tags mt ON m.id = mt.memory_id
  LEFT JOIN tags t ON mt.tag_id = t.id
  WHERE m.description ILIKE $1 ${tagList.length ? `OR t.name IN (${tagPlaceholders1})` : ''}
),
assistant_ranking AS (
  SELECT a.id AS assistant_id,
         COUNT(DISTINCT om.memory_id) AS memory_match_count
  FROM assistants a
  LEFT JOIN owned_memories om ON a.id = om.assistant_id
  LEFT JOIN relevant_memories rm ON om.memory_id = rm.id
  ${
    tagList.length
      ? `LEFT JOIN assistant_tags at ON a.id = at.assistant_id
  LEFT JOIN tags t2 ON at.tag_id = t2.id`
      : ''
  }
  WHERE rm.id IS NOT NULL ${tagList.length ? `OR t2.name IN (${tagPlaceholders2})` : ''}
  GROUP BY a.id
),
final_ranking AS (
  SELECT ar.assistant_id,
         ar.memory_match_count,
         COALESCE(AVG(f.rating), 0) AS avg_feedback
  FROM assistant_ranking ar
  LEFT JOIN feedback f ON f.target_id = ar.assistant_id AND f.target_type = 'assistant'
  GROUP BY ar.assistant_id, ar.memory_match_count
)
SELECT assistant_id,
       (memory_match_count + avg_feedback) AS score
FROM final_ranking
ORDER BY score DESC
LIMIT 5;
`;

    const params = [taskDescription, ...tagList, ...tagList];
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query<{ assistant_id: string; score: number }>(query, params);
      return rows.map((row) => ({
        assistantId: row.assistant_id,
        score: Number(row.score),
      }));
    } finally {
      client.release();
    }
  }
}
