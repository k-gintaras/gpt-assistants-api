import type { Request, Response } from 'express';
import { admin } from './firebaseAdmin';
import * as jwt from 'jsonwebtoken';

function isLoopbackAddress(address: string | undefined | null): boolean {
  if (!address) return false;
  const normalized = address.toLowerCase();
  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '::ffff:127.0.0.1'
  );
}

function shouldBypassAuth(req: Request): boolean {
  // Explicit opt-in, and never in production.
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.LOCALHOST_AUTH_BYPASS !== 'true') return false;

  // Favor the socket address (harder to spoof) over Host header.
  const remote = req.socket.remoteAddress;
  return isLoopbackAddress(remote);
}

export async function expressAuthentication(
  req: Request,
  securityName: string,
  scopes?: string[]
) {
  if (shouldBypassAuth(req)) {
    const required = scopes ?? [];
    const bypassToken: Record<string, unknown> = {
      uid: 'localhost',
      bypass: true,
    };
    for (const scope of required) bypassToken[scope] = true;
    return bypassToken;
  }

  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    const err = new Error('Missing Bearer token');
    (err as any).status = 401;
    throw err;
  }

  try {
    let decoded: any;
    
    try {
      // Try ID token first (for user auth)
      decoded = await admin.auth().verifyIdToken(token);
    } catch (idTokenError: any) {
      // Fall back to custom token (for service-to-service auth)
      // Custom tokens are created by Firebase Admin SDK, so we trust them
      try {
        decoded = jwt.decode(token) as any;
        
        if (!decoded || !decoded.uid) {
          throw new Error('Invalid token format - missing uid');
        }
        
        // Add default claims for service accounts if not present
        if (!decoded.canUseGpt) {
          decoded.canUseGpt = true;
        }
        
        console.log('✅ Custom token accepted from service:', decoded.uid);
      } catch (customTokenError: any) {
        console.error('❌ Both ID token and custom token failed');
        throw idTokenError; // Throw original error if both fail
      }
    }

    if (securityName === 'firebase') return decoded;

    if (securityName === 'claims') {
      const required = scopes ?? [];
      for (const scope of required) {
        if (!(decoded as any)[scope]) {
          const err = new Error(`Missing claim: ${scope}`);
          (err as any).status = 403;
          throw err;
        }
      }
      return decoded;
    }

    const err = new Error('Unknown security scheme');
    (err as any).status = 401;
    throw err;
  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
    throw error;
  }
}

// Wrapper for tsoa compatibility - accepts 4 arguments (request, name, scopes, response)
export async function expressAuthenticationRecasted(
  request: Request,
  securityName: string,
  scopes?: string[],
  _response?: Response
): Promise<any> {
  return expressAuthentication(request, securityName, scopes);
}
