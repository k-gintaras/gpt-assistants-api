# Setup Guide

## Prerequisites

- Node.js (version 16 or higher recommended)
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)

## Installation

1. **Clone the Repository**:

   ```sh
   git clone https://github.com/k-gintaras/gpt-assistants-api.git
   cd gpt-assistants-api
   ```

2. **Install Dependencies**:

   ```sh
   npm install
   ```

3. **Setup Environment Variables**:

   Create a `.env` file in the project root with the following:

   ```env
   DB_HOST=db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=gpt_assistants
   NODE_ENV=production
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_PROJECT_KEY=your_openai_project_key
   ```

   - Replace `your_openai_api_key` and `your_openai_project_key` with your actual OpenAI credentials.

4. **Run with Docker**:

   ```sh
   docker-compose up --build
   ```

   This command will:
   - Build and start a PostgreSQL database container.
   - Build and start the API server container.
   - Initialize the database schema.

5. **Verify Setup**:

   - API Server: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api-docs
   - Check Docker logs: `docker-compose logs -f`

## Running Locally (Without Docker)

1. **Start PostgreSQL**:

   - Use Docker for DB: `docker-compose up db`
   - Or install PostgreSQL locally and create the database.

2. **Initialize Database**:

   ```sh
   npm run initdb
   ```

3. **Start the Server**:

   ```sh
   npm run dev
   ```

## Database Management

- **Reset Database**: `docker-compose exec db psql -U postgres -d gpt_assistants -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`
- **Backup Database**: `docker-compose exec db pg_dump -U postgres -F c gpt_assistants > backup.sql`
- **Access DB Shell**: `npm run db`

## Troubleshooting

- Ensure ports 3000 and 5432 are free.
- Check `.env` for correct values.
- For CORS issues with frontend, the server allows `http://localhost:4200`.
