import { Pool } from 'pg';
import { Session } from '../../models/session.model';
import { SessionsService } from '../sqlite-services/sessions.service';

export class SessionsControllerService {
  private sessionService: SessionsService;

  constructor(pool: Pool) {
    this.sessionService = new SessionsService(pool);
  }

  // Create a new session
  async createSession(assistantId: string, userId: string, name: string): Promise<Session> {
    return await this.sessionService.createSession(assistantId, userId, name);
  }

  // Get all sessions
  async getAllSessions(): Promise<Session[]> {
    return await this.sessionService.getAllSessions();
  }

  // Get a session by ID
  async getSessionById(sessionId: string): Promise<Session | null> {
    return await this.sessionService.getSessionById(sessionId);
  }

  // Update session (e.g., end session)
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
    return await this.sessionService.updateSession(sessionId, updates);
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.sessionService.deleteSession(sessionId);
  }
}
