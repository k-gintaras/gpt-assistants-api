import { Route, Tags, Get, Post, Put, Delete, Path, Body, ValidateError, SuccessResponse } from 'tsoa';
import { SessionsControllerService } from '../services/core-services/sessions.controller.service';
import { getDb } from '../database/database';
import { Session } from '../models/session.model';

@Route('sessions')
@Tags('Sessions')
export class SessionsController {
  private readonly sessionControllerService: SessionsControllerService;

  constructor() {
    const pool = getDb().getInstance();
    this.sessionControllerService = new SessionsControllerService(pool);
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  public async createSession(@Body() body: { assistantId: string; userId: string; name: string }): Promise<Session> {
    const session = await this.sessionControllerService.createSession(body.assistantId, body.userId, body.name);
    return session;
  }

  @Get('/')
  public async getAllSessions(): Promise<Session[]> {
    const sessions = await this.sessionControllerService.getAllSessions();
    return sessions;
  }

  @Get('/{sessionId}')
  public async getSessionById(@Path() sessionId: string): Promise<Session> {
    const session = await this.sessionControllerService.getSessionById(sessionId);
    if (!session) throw new ValidateError({}, 'Session not found.');
    return session;
  }

  @Put('/{sessionId}')
  public async updateSession(@Path() sessionId: string, @Body() updates: Partial<Session>): Promise<Session> {
    const updated = await this.sessionControllerService.updateSession(sessionId, updates);
    if (!updated) throw new ValidateError({}, 'Session not found.');
    return updated;
  }

  @Delete('/{sessionId}')
  public async deleteSession(@Path() sessionId: string): Promise<void> {
    const deleted = await this.sessionControllerService.deleteSession(sessionId);
    if (!deleted) throw new ValidateError({}, 'Session not found.');
  }
}
