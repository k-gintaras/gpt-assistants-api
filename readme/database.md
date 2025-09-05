# Database Guide

The project uses PostgreSQL for data persistence.

## Connection
- Managed by `DbHelper` in `src/database/database.ts`
- Pool configuration from `.env`
- Singleton instance via `getDb()`

## Schema
- Tables defined in `src/database/pg-tables.sql`
- Key tables:
  - `assistants`: AI assistants
  - `memories`: Knowledge storage
  - `chats`: Conversation threads
  - `chat_messages`: Messages in chats
  - `sessions`: User sessions
  - `tasks`: Tasks
  - `tags`: Tagging system
  - `feedback`: User feedback
  - `relationship_graph`: Connections

## Initialization
- Automatic on app start via `db.initialize()`
- Loads schema if tables don't exist

## Management
- **Reset**: `db.reset()` clears data, reloads schema
- **Update**: Run SQL files via `runUpdateOnDatabase`
- **Backup**: Use `pg_dump` as shown in setup

## Queries
- Use `pg` library for raw queries
- Services in `src/services/sqlite-services/` handle DB logic

## Testing
- Test DB: `gpt_assistants_test`
- Use `getTestDb()` for isolated tests

## Best Practices
- Use transactions for multi-step operations
- Index frequently queried columns
- Avoid SQL injection with parameterized queries
