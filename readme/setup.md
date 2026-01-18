# Setup Guide

## Prerequisites

- Docker and Docker Compose
- OpenAI API keys

## Quick Launch Steps

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/k-gintaras/gpt-assistants-api.git
   cd gpt-assistants-api
   ```

2. **Setup Environment**:
   ```sh
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY and OPENAI_PROJECT_KEY
   ```

3. **Launch with Docker**:
   ```sh
   docker-compose up --build
   ```

4. **Verify**:
   - API: `http://localhost:3001`
   - Docs: `http://localhost:3001/api-docs`

## Database Reset (if needed)

If you need to reset the database:

```sh
docker-compose exec server npm run initdb -- --reset
```

## Development (Local)

For local development without Docker:

1. Install Node.js 18+
2. `npm install`
3. Setup PostgreSQL (use Docker: `docker-compose up -d db`)
4. `npm run tsoa:gen` (generate routes and swagger)
5. `npm run initdb` (initialize database)
6. `npm run dev` (start server on port 3000)

---

## Firebase ID Token Authentication (GPT Routes)

### Server Setup

**Protected routes** (GPT/OpenAI calls):
- `POST /prompt` → requires `canUseGpt` claim
- `POST /conversation/*` → requires `canUseGpt` claim

**Public routes** (database CRUD):
- All assistant, memory, task, etc. endpoints remain **public** by default.

### Local Development: Skip Auth

To bypass token verification on localhost (dev only):

```bash
# PowerShell
$env:LOCALHOST_AUTH_BYPASS="true"
$env:NODE_ENV="development"
npm run dev
```

Then query any endpoint without a Bearer token:
```bash
curl http://localhost:3000/prompt -X POST -H "Content-Type: application/json" -d '{"id":"...","prompt":"..."}'
```

### Production: Firebase Admin Setup

1. **Create Firebase project** (if not already done):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication > Sign-in methods > Email/Password (or your preferred method)

2. **Set service account credentials** (local dev):
   ```bash
   # Download service account JSON from Firebase > Project Settings > Service Accounts
   # Option A: Environment variable (recommended for dev)
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
   
   # Option B: .env file (do NOT commit)
   # GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   ```

3. **Verify Firebase connection**:
   ```bash
   npm run dev
   # Check console for ✅ Database initialized
   ```

### Set Custom Claims (canUseGpt)

Allow a user to use GPT endpoints:

```bash
npm run set-claims <user-uid> true
```

Revoke access:
```bash
npm run set-claims <user-uid> false
```

### Admin Management

#### Bootstrap First Admin (One-time setup)

After deploying to production, make the first admin user:

```bash
npm run bootstrap-admin <initial-admin-uid>
```

This grants the user:
- `role: 'admin'` claim
- `canUseGpt: true` claim

#### Admin Endpoints

Once you have an admin user with `role: 'admin'` claim:

**Check your token/claims** (debug endpoint):
```bash
curl http://localhost:3000/auth/whoami \
  -H "Authorization: Bearer <your-id-token>"
```

Returns your decoded token with all claims:
```json
{
  "uid": "user123",
  "role": "admin",
  "canUseGpt": true,
  "email": "admin@example.com",
  // ... other Firebase properties
}
```

**Grant claims to a user** (admin only):
```bash
curl http://localhost:3000/admin/users/<target-uid>/claims \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "canUseGpt": true,
    "role": "user"
  }'
```

This merges claims (doesn't overwrite existing ones). Only admins can call this endpoint.

---

1. **Add Firebase interceptor** (sends Bearer token):

```typescript
// firebase-auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable()
export class FirebaseAuthInterceptor implements HttpInterceptor {
  constructor(private auth: Auth) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.auth.currentUser?.getIdToken() ?? Promise.resolve(null)).pipe(
      switchMap((token) => {
        if (!token) return next.handle(req);
        return next.handle(
          req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          })
        );
      })
    );
  }
}

// app.config.ts or main.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: FirebaseAuthInterceptor, multi: true },
]
```

2. **After granting canUseGpt claim, force token refresh**:

```typescript
// In your auth service
await this.auth.currentUser?.getIdToken(true);  // Force refresh
```

### Testing with curl

**Protected endpoint (prompt)** — requires Bearer token:
```bash
curl http://localhost:3000/prompt \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebaseIdToken>" \
  -d '{"id":"assistant-id","prompt":"Hello"}'

# Without token: 401 Unauthorized
# Without claim: 403 Forbidden
# With claim: 200 OK (executes GPT call)
```

**Public endpoint (assistants)** — no token needed:
```bash
curl http://localhost:3000/assistant \
  -X GET
# 200 OK (lists all assistants)
```
