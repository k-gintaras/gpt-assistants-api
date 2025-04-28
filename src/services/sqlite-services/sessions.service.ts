import { Pool } from 'pg';
import { generateUniqueId } from './unique-id.service';
import { Session } from '../../models/session.model'; // Import the interface

export class SessionsService {
  constructor(private pool: Pool) {}

  // Get all sessions
  async getAllSessions(): Promise<Session[]> {
    const result = await this.pool.query('SELECT * FROM sessions');
    return result.rows; // Returning array of Session objects
  }

  // Create a new session
  async createSession(assistantId: string, userId: string, name: string): Promise<Session> {
    const sessionId = generateUniqueId();
    const createdAt = new Date().toISOString();
    const startedAt = createdAt;

    const stmt = `
      INSERT INTO sessions (id, assistant_id, user_id, name, started_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await this.pool.query(stmt, [sessionId, assistantId, userId, name, startedAt, createdAt]);

    return result.rows[0]; // Returning the created Session object
  }

  // Get session by ID
  async getSessionById(sessionId: string): Promise<Session | null> {
    const result = await this.pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);

    if (result.rowCount === 0) {
      return null; // Return null if no session found
    }

    return result.rows[0]; // Return the found session object
  }

  // Update session (e.g., set ended_at)
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
    const { ended_at } = updates;
    const stmt = `
      UPDATE sessions
      SET ended_at = COALESCE($1, ended_at)
      WHERE id = $2
      RETURNING *;
    `;

    const result = await this.pool.query(stmt, [ended_at || null, sessionId]);

    if (result.rowCount === 0) {
      return null; // Return null if no session was updated
    }

    return result.rows[0]; // Return updated session
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    if (!result.rowCount) return false;
    return result.rowCount > 0; // Return true if deleted
  }
}
