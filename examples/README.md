Examples — quick notes

1) `examples/chat.ts` — programmatic demo

- Purpose: Demonstrates calling `ConversationService.ask(...)` to create a chat/session and save memories.
- Requirements:
  - A running PostgreSQL instance and `DATABASE_URL` environment variable pointing to it.
  - The database schema initialized (run `npm run initdb` when connected to your Postgres).
  - An assistant row present in the `assistants` table with the ID you pass as `EXAMPLE_ASSISTANT_ID`.

2) Minimal SQL to create a test assistant (run against the DB after init):

```sql
INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
VALUES ('test-assistant-id', 'Example Assistant', 'Assistant used in local examples', 'chat', 'gpt-3.5-turbo', now(), now());
```

Note: real assistants may require additional columns or related rows depending on your schema and how `FullAssistantService` expects the data. The snippet above is the minimal starting point for basic flows.

3) Run the example (from repo root):

```bash
# set DATABASE_URL in env; optionally set EXAMPLE_ASSISTANT_ID
DATABASE_URL=postgres://user:pass@localhost:5432/gpt_assistants_api \
EXAMPLE_ASSISTANT_ID=test-assistant-id \
EXAMPLE_USER_ID=local-user \
 npx ts-node examples/chat.ts
```

4) If you don't have Postgres locally and want a throwaway in-memory run, consider using the unit test helpers or pg-mem in a small script. If you'd like, I can add a second example that uses `pg-mem` to create a fully isolated in-memory demo (creates tables, inserts an assistant, runs conversation) — say "add in-memory example" and I'll add it.
