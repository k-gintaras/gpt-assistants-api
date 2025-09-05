import { Pool } from 'pg';
import { TaskRequest } from '../../models/service-models/orchestrator.service.model';
import { AssistantSuggestion } from '../../models/service-models/orchestrator.service.model';

export class AssistantSuggestionService {
  constructor(private pool: Pool) {}

  async suggestAssistants(task: TaskRequest, tags?: string[]): Promise<AssistantSuggestion[]> {
    const taskDescription = `%${task.description}%`;
    const tagList = tags && tags.length ? tags : [];
    
    const client = await this.pool.connect();
    try {
      // Start with a working base query and build it dynamically
      let query = `
        SELECT DISTINCT a.id AS assistant_id,
               (
                 COALESCE(memory_score.score, 0) + 
                 COALESCE(tag_score.score, 0) + 
                 COALESCE(feedback_score.score, 0)
               ) AS score
        FROM assistants a
        LEFT JOIN (
          SELECT om.assistant_id, COUNT(DISTINCT m.id) * 2 AS score
          FROM owned_memories om
          JOIN memories m ON om.memory_id = m.id
          WHERE LOWER(m.description) LIKE LOWER($1)
          GROUP BY om.assistant_id
        ) memory_score ON a.id = memory_score.assistant_id
        LEFT JOIN (
          SELECT at.assistant_id, COUNT(DISTINCT t.id) AS score
          FROM assistant_tags at
          JOIN tags t ON at.tag_id = t.id
          WHERE LOWER(t.name) LIKE LOWER($1)
          GROUP BY at.assistant_id
        ) tag_score ON a.id = tag_score.assistant_id
        LEFT JOIN (
          SELECT target_id AS assistant_id, AVG(rating) AS score
          FROM feedback
          WHERE target_type = 'assistant'
          GROUP BY target_id
        ) feedback_score ON a.id = feedback_score.assistant_id
        WHERE (memory_score.score > 0 OR tag_score.score > 0)`;

      const params = [taskDescription];
      
      // Add tag filtering if tags are provided
      if (tagList.length > 0) {
        const tagPlaceholders = tagList.map((_, i) => `$${i + 2}`).join(', ');
        query += ` OR a.id IN (
          SELECT DISTINCT at.assistant_id 
          FROM assistant_tags at 
          JOIN tags t ON at.tag_id = t.id 
          WHERE LOWER(t.name) IN (${tagPlaceholders})
        )`;
        params.push(...tagList.map(tag => tag.toLowerCase()));
      }
      
      query += `
        ORDER BY score DESC
        LIMIT 5;
      `;

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
