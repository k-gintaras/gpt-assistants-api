# Quickstart — Get running in < 5 minutes

This project uses PostgreSQL for full runs, but many unit tests use an in-memory DB so you can explore the code without installing Postgres.

Prerequisites

- Docker (recommended for Postgres) OR a running Postgres instance

1. Clone & setup

```bash
git clone <repo-url>
cd gpt-assistants-api
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and OPENAI_PROJECT_KEY
```

2. Launch with Docker

```bash
docker-compose up --build
```

The API runs at `http://localhost:3001`, docs at `http://localhost:3001/api-docs`.

3. Database reset (if needed)

```bash
docker-compose exec server npm run initdb -- --reset
```

