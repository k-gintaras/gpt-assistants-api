import { Request, Response } from 'express';
import { Pool } from 'pg';
import { respond } from './controller.helper';
import { SessionsControllerService } from '../services/core-services/sessions.controller.service';

export class SessionsController {
  private readonly sessionControllerService: SessionsControllerService;

  constructor(db: Pool) {
    this.sessionControllerService = new SessionsControllerService(db);
  }

  /**
   * Create a new session.
   * @requestBody { assistantId: string, userId: string, name: string }
   * @response {201} { status: "success", message: "Session created successfully.", data: { sessionId: string } }
   * @response {400} { status: "error", message: "Session not created." }
   * @response {500} { status: "error", message: "Failed to create session.", error: any }
   */
  async createSession(req: Request, res: Response) {
    const { assistantId, userId, name } = req.body;
    try {
      const sessionId = await this.sessionControllerService.createSession(assistantId, userId, name);
      return respond(res, 201, 'Session created successfully.', { sessionId });
    } catch (error) {
      return respond(res, 500, 'Failed to create session.', null, error);
    }
  }

  /**
   * Get all sessions.
   * @response {200} { status: "success", message: "Sessions fetched successfully", data: Session[] }
   * @response {500} { status: "error", message: "Failed to retrieve sessions.", error: any }
   */
  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await this.sessionControllerService.getAllSessions();
      return respond(res, 200, 'Sessions fetched successfully', sessions);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve sessions.', null, error);
    }
  }

  /**
   * Get session by ID.
   * @requestParams { sessionId: string }
   * @response {200} { status: "success", message: "Session fetched successfully", data: Session }
   * @response {404} { status: "error", message: "Session not found." }
   * @response {500} { status: "error", message: "Failed to retrieve session.", error: any }
   */
  async getSessionById(req: Request, res: Response) {
    const { sessionId } = req.params;
    try {
      const session = await this.sessionControllerService.getSessionById(sessionId);
      if (!session) {
        return respond(res, 404, 'Session not found.');
      }
      return respond(res, 200, 'Session fetched successfully', session);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve session.', null, error);
    }
  }

  /**
   * Update a session (e.g., set the session as ended).
   * @requestParams { sessionId: string }
   * @requestBody { ended_at?: string }
   * @response {200} { status: "success", message: "Session updated successfully." }
   * @response {404} { status: "error", message: "Session not found." }
   * @response {500} { status: "error", message: "Failed to update session.", error: any }
   */
  async updateSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const updates = req.body;
    try {
      const updated = await this.sessionControllerService.updateSession(sessionId, updates);
      if (!updated) {
        return respond(res, 404, 'Session not found.');
      }
      return respond(res, 200, 'Session updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update session.', null, error);
    }
  }

  /**
   * Delete a session.
   * @requestParams { sessionId: string }
   * @response {200} { status: "success", message: "Session deleted successfully." }
   * @response {404} { status: "error", message: "Session not found." }
   * @response {500} { status: "error", message: "Failed to delete session.", error: any }
   */
  async deleteSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    try {
      const deleted = await this.sessionControllerService.deleteSession(sessionId);
      if (!deleted) {
        return respond(res, 404, 'Session not found.');
      }
      return respond(res, 200, 'Session deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete session.', null, error);
    }
  }
}
