import { Body, Controller, Post, Get, Request, Route, Security, Tags, Path } from 'tsoa';
import type { Request as ExRequest } from 'express';
import { admin } from '../firebaseAdmin';

type SetClaimsBody = {
  canUseGpt?: boolean;
  role?: 'admin' | 'user';
};

@Route('admin')
@Tags('Admin')
export class AdminClaimsController extends Controller {
  @Get('whoami')
  @Security('firebase')
  public async getWhoami(
    @Request() req: ExRequest
  ): Promise<any> {
    const user = (req as any).user as any;
    if (!user) {
      this.setStatus(401);
      return { error: 'Unauthorized: No user info' };
    }

    try {
      const firebaseUser = await admin.auth().getUser(user.uid);
      return {
        uid: user.uid,
        email: user.email,
        customClaims: firebaseUser.customClaims ?? {},
        emailVerified: user.email_verified,
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        error: 'Failed to fetch user info',
        details: error.message,
      };
    }
  }

  @Get('health')
  public async getHealth(): Promise<any> {
    try {
      // Test Firebase Admin SDK
      const firebaseApp = admin.app();
      const auth = admin.auth();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        firebase: {
          initialized: true,
          app: firebaseApp ? 'initialized' : 'not initialized',
          auth: auth ? 'available' : 'not available',
        },
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        firebase: {
          initialized: false,
          error: error.message,
        },
      };
    }
  }

  @Post('users/{uid}/claims')
  @Security('firebase')
  public async setClaims(
    @Path() uid: string,
    @Body() body: SetClaimsBody,
    @Request() req: ExRequest
  ): Promise<any> {
    const caller = (req as any).user as any;
    const root = process.env.ROOT_ADMIN_UID;
    const isRoot = Boolean(root && caller?.uid === root);

    if (!isRoot && caller?.role !== 'admin') {
      this.setStatus(403);
      return { error: 'Admin only' };
    }

    const target = await admin.auth().getUser(uid);
    const existing = target.customClaims ?? {};

    const next: any = { ...existing };
    if (typeof body.canUseGpt === 'boolean') next.canUseGpt = body.canUseGpt;
    if (typeof body.role === 'string') next.role = body.role;

    await admin.auth().setCustomUserClaims(uid, next);

    return { ok: true, uid, applied: body, mergedClaims: next };
  }

}
