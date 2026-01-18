import { Body, Controller, Post, Request, Route, Security, Tags, Path } from 'tsoa';
import type { Request as ExRequest } from 'express';
import { admin } from '../firebaseAdmin';

type SetClaimsBody = {
  canUseGpt?: boolean;
  role?: 'admin' | 'user';
};

@Route('admin')
@Tags('Admin')
export class AdminClaimsController extends Controller {
  @Post('users/{uid}/claims')
  @Security('claims', ['role'])
  public async setClaims(
    @Path() uid: string,
    @Body() body: SetClaimsBody,
    @Request() req: ExRequest
  ): Promise<any> {
    const caller = (req as any).user as any;
    if (caller?.role !== 'admin') {
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
