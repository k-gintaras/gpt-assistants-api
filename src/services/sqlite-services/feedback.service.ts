import { Pool } from 'pg';
import { Feedback, FeedbackRow } from '../../models/feedback.model';
import { generateUniqueId } from './unique-id.service';

export class FeedbackService {
  constructor(private pool: Pool) {}

  async getFeedbackById(id: string): Promise<Feedback | null> {
    const result = await this.pool.query<FeedbackRow>('SELECT * FROM feedback WHERE id = $1', [id]);
    if (result.rowCount === 0) return null;

    const feedbackRow = result.rows[0];
    return {
      id: feedbackRow.id,
      targetId: feedbackRow.target_id,
      targetType: feedbackRow.target_type,
      rating: feedbackRow.rating,
      comments: feedbackRow.comments || undefined,
      createdAt: new Date(feedbackRow.created_at),
      updatedAt: new Date(feedbackRow.updated_at),
    };
  }

  async getFeedbackByTarget(targetId: string, targetType: 'assistant' | 'memory' | 'task'): Promise<Feedback[]> {
    const results = await this.pool.query<FeedbackRow>('SELECT * FROM feedback WHERE target_id = $1 AND target_type = $2', [targetId, targetType]);

    return results.rows.map((result) => ({
      id: result.id,
      targetId: result.target_id,
      targetType: result.target_type,
      rating: result.rating,
      comments: result.comments || undefined,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    }));
  }

  async addFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = `
      INSERT INTO feedback (id, target_id, target_type, rating, comments, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.pool.query(stmt, [id, feedback.targetId, feedback.targetType, feedback.rating, feedback.comments || null, createdAt, updatedAt]);

    return id;
  }

  async updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existingFeedbackResult = await this.pool.query<FeedbackRow>('SELECT * FROM feedback WHERE id = $1', [id]);

    if (existingFeedbackResult.rowCount === 0) {
      throw new Error(`Feedback with ID ${id} not found.`);
    }

    const stmt = `
      UPDATE feedback
      SET
        target_id = COALESCE($1, target_id),
        target_type = COALESCE($2, target_type),
        rating = COALESCE($3, rating),
        comments = COALESCE($4, comments),
        updated_at = $5
      WHERE id = $6
    `;

    await this.pool.query(stmt, [updates.targetId || null, updates.targetType || null, updates.rating || null, updates.comments || null, new Date().toISOString(), id]);

    return true;
  }

  async deleteFeedback(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM feedback WHERE id = $1', [id]);
    if (!result.rowCount) return false;

    return result.rowCount > 0;
  }
}
