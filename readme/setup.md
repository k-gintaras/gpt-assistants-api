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
