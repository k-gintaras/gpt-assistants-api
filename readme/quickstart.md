# Quickstart — Get running in < 5 minutes

This project uses PostgreSQL for full runs, but many unit tests use an in-memory DB so you can explore the code without installing Postgres.

Prerequisites
- Node.js 18+ / npm
- Docker (recommended for Postgres) OR a running Postgres instance

1) Clone & install

```bash
git clone <repo-url>
cd codator
npm install
```

2) Start Postgres (recommended)

If you have Docker installed you can start a local Postgres instance with the provided compose file:

```bash
docker-compose up -d
```

This creates a database container named `gpt-assistants-api-db-1`. Configure `DATABASE_URL` or the env vars in `readme/setup.md` if you want custom credentials.

3) Run database initialization (if using Postgres)

```bash
npm run initdb
```

4) Run the development server

```bash
npm run dev
```

The server runs `ts-node src/app.ts` and exposes the API (see `readme/api.md` for endpoints). The API docs are available at `http://localhost:3000/api-docs` when the server is running.

5) Quick local tests (no Postgres required)

Unit tests are configured to use an in-memory DB for many suites.

```bash
npm test
# or run only conversation tests (fast)
npx jest src/tests/unit/feature-tests/conversation-tests --runInBand
```

Quick usage examples
- Programmatic chat using the orchestrator (recommended): use `ConversationService` to send an ask/prompt and get back `{ chatId, sessionId, answer }` — this automatically creates sessions/chats/memories and handles expiry.
- Legacy single-shot prompts: `PromptService` can be used for quick prompts that directly call the GPT wrappers.

If you want a tiny runnable example script added (programmatic example that creates an assistant and sends a prompt), ask me to "create example" and I'll commit `examples/chat.ts` that demonstrates the full flow.

Troubleshooting
- If tests fail due to DB errors, ensure Docker is running (for integration tests) or run targeted unit tests which use pg-mem.
- Check `readme/setup.md` for env var configuration and DB credentials.

Next steps (recommended)
- Read `readme/features.md` to understand memories, tasks, and assistant types.
- Add a `.env` file with `DATABASE_URL` and `OPENAI_API_KEY` to enable external AI APIs.

