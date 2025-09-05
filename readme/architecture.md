# Architecture Overview

This project is a modular Express.js API integrated with PostgreSQL, designed for AI-driven workflows like managing assistants, memories, and conversations.

## High-Level Architecture

- **Frontend Integration**: Supports CORS for Angular apps (e.g., localhost:4200).
- **API Layer**: RESTful endpoints with Express.js.
- **Business Logic**: Services handle DB queries and AI interactions.
- **Database**: PostgreSQL for persistent storage.
- **AI Integration**: OpenAI API for GPT completions.
- **Documentation**: Swagger auto-generated docs.

## Project Structure

```
src/
├── app.ts                 # Main app, route setup, Swagger
├── database/
│   ├── database.ts        # DB connection, init, reset
│   └── pg-tables.sql      # Schema
├── controllers/           # Express controllers (API logic)
├── routes/                # Route definitions
├── services/
│   ├── sqlite-services/   # DB query services
│   └── core-services/     # Controller services (middleware)
├── models/                # TypeScript interfaces
├── transformers/          # Data transformers
└── ...
tools/                     # Utilities like add-functionality.ts
```

## Key Components

- **DbHelper**: Manages PostgreSQL connections, schema loading, data reset.
- **Services Layer**: Separates DB logic from API logic for modularity.
- **Controllers**: Handle requests, validate, call services.
- **Routes**: Map URLs to controllers.
- **Models**: Define data structures (e.g., Chat, Memory).
- **Swagger**: Generates API docs from JSDoc comments.

## Data Flow

1. Request → Route → Controller → Service → DB/AI API
2. Response flows back similarly.

## Technologies

- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL, pg library
- **AI**: OpenAI SDK
- **Docs**: Swagger UI
- **Testing**: Jest
- **Linting**: ESLint
- **Build**: TypeScript compiler

## Scalability

- Modular design allows easy addition of features.
- DB pooling for connections.
- Docker for containerization.
