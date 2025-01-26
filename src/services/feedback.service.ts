import Database from 'better-sqlite3';
import { Feedback, FeedbackRow } from '../models/feedback.model';
import { generateUniqueId } from './unique-id.service';

export const feedbackService = {
  db: new Database(':memory:'),

  setDb(newDb: Database.Database) {
    this.db = newDb;
  },

  getFeedbackById(id: string): Feedback | null {
    const stmt = this.db.prepare('SELECT * FROM feedback WHERE id = ?');
    const result = stmt.get(id) as FeedbackRow;

    if (!result) return null;

    // Map database fields to Feedback interface
    return {
      id: result.id,
      targetId: result.target_id,
      targetType: result.target_type,
      userId: result.user_id || undefined,
      rating: result.rating,
      comments: result.comments || undefined,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  },

  getFeedbackByTarget(targetId: string, targetType: 'assistant' | 'memory' | 'task'): Feedback[] {
    const stmt = this.db.prepare('SELECT * FROM feedback WHERE target_id = ? AND target_type = ?');
    const results = stmt.all(targetId, targetType) as FeedbackRow[];

    // Map database fields to Feedback interface
    return results.map((result) => ({
      id: result.id,
      targetId: result.target_id,
      targetType: result.target_type,
      userId: result.user_id || undefined,
      rating: result.rating,
      comments: result.comments || undefined,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    }));
  },

  async addFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = this.db.prepare(`
      INSERT INTO feedback (id, target_id, target_type, user_id, rating, comments, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, feedback.targetId, feedback.targetType, feedback.userId || null, feedback.rating, feedback.comments || null, createdAt, updatedAt);

    return id;
  },

  async updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existingFeedback = this.db.prepare('SELECT * FROM feedback WHERE id = ?').get(id);

    if (!existingFeedback) {
      throw new Error(`Feedback with ID ${id} not found.`);
    }

    const stmt = this.db.prepare(`
      UPDATE feedback
      SET
        target_id = COALESCE(?, target_id),
        target_type = COALESCE(?, target_type),
        user_id = COALESCE(?, user_id),
        rating = COALESCE(?, rating),
        comments = COALESCE(?, comments),
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(updates.targetId || null, updates.targetType || null, updates.userId || null, updates.rating || null, updates.comments || null, new Date().toISOString(), id);

    return true;
  },

  async deleteFeedback(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM feedback WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  },
};
