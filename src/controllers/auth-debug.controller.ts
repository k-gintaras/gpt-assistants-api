import { Controller, Get, Request, Route, Security, Tags } from 'tsoa';
import type { Request as ExRequest } from 'express';

@Route('auth')
@Tags('Auth')
export class AuthDebugController extends Controller {
  @Get('whoami')
  @Security('firebase')
  public async whoami(@Request() req: ExRequest): Promise<any> {
    // tsoa puts decoded token onto req.user for @Security routes
    // If not present due to config, fallback to empty.
    return (req as any).user ?? { error: 'no user on request' };
  }
}
