# GPT Assistants API

A modular, PostgreSQL-backed API designed for interfacing with OpenAI's GPT models, structured to support various assistants, tasks, and learning tools. This API provides a scalable foundation for AI-driven workflows, decision-making, and knowledge management.

## Features

- 🚀 **Dynamic AI Assistants** – Create, modify, and manage AI-powered assistants with structured database support.
- 🗄 **PostgreSQL Integration** – Persistent storage for assistants, tasks, memory, and other structured data.
- 📡 **Modular API Architecture** – Well-structured services, controllers, and routes for easy expansion.
- 🛠 **Robust Error Handling** – Clear logging, retries, and proper DB connection management.
- 🔗 **Seamless OpenAI API Connectivity** – Supports `OPENAI_API_KEY` and `OPENAI_PROJECT_KEY` for chat completion requests.
- 🔄 **Dockerized for Deployment** – Fully containerized setup for PostgreSQL and API, ensuring smooth deployment.
- 📊 **Scalable Usage** – Can be integrated into other apps, extensions, or APIs.

## Assistant and prompt usage with memories

1. Assistant Update
   Chat Assistants: Only basic fields are updated. No instructions are involved, and memories stay as-is.
   Regular Assistants: Focused memories are treated as instructions only when the assistant is updated. These are saved and used in GPT.
   Instructions remain ignored until the assistant is updated, even though they exist in the system.
2. Prompting the Assistant
   Both Chat Assistants and Regular Assistants receive limited focused memories based on the focus rule.
   Chat Assistant: Uses all memories, treating everything as context (conversation).
   Regular Assistant: Filters out instructions (as they are internal to GPT) and uses only non-instruction memories for context in the prompt.
   Key Points:
   Chat Assistant: Updates only basic fields, no instructions. Memories are treated as conversation context.
   Regular Assistant: Focused memories are saved as instructions only upon update and are otherwise ignored in prompts.

## Setup & Installation

### 1. Clone the Repository

```sh
git clone https://github.com/k-gintaras/gpt-assistants-api.git
cd gpt-assistants-api
```

### 2. Setup Environment Variables

Create a `.env` file in the project root and configure:

```ini
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=gpt_assistants
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key
OPENAI_PROJECT_KEY=your_openai_project_key
```

### 3. Run with Docker

```sh
docker-compose up --build
```

This will:

- Start a **PostgreSQL** database.
- Build and launch the **API server**.

### 3.1 Run Just Server

```sh
ts-node src/app.ts
```

You can then just go to
localhost:3000/api-docs
to see them docs and try api
BEWARE: api docs not perfect, not all inputs are correct, you might need to go check src/controllers/controllerName.controller.ts

### 4. Verify Everything is Running

```sh
docker ps
```

Check logs:

```sh
docker-compose logs -f
```

Once running, the API will be available at:

```
http://localhost:3000
```

## Example Endpoints & Usage

get all from
http://localhost:3000/api-docs

### Assistant Routes

- `GET /assistant/` – Fetch all assistants.
- `GET /assistant/:id` – Fetch a specific assistant.
- `POST /assistant/` – Create a new assistant.
- `PUT /assistant/:id` – Update an assistant.
- `DELETE /assistant/:id` – Remove an assistant.

### Task Routes

- `GET /task/` – Fetch all tasks.
- `POST /task/` – Create a new task.

### Memory & Learning Routes

- `GET /memory/` – Retrieve stored knowledge.
- `POST /memory/` – Save new information.

### Chat Completion (GPT)

- `POST /chat/` – Generate responses using OpenAI’s API.

## Database Management

### Reset Database

If needed, you can manually reset the database:

```sh
docker-compose exec db psql -U postgres -d gpt_assistants -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### Backup Database

Run a manual backup:

```sh
docker-compose exec db pg_dump -U postgres -F c gpt_assistants > backup.sql
```

## Development & Contribution

### Run API Locally (Without Docker)

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start PostgreSQL manually or use an existing database.
3. Run migrations (if applicable).
4. Start API server:
   ```sh
   npm run dev
   ```

### Run Tests

```sh
npm test
```

### Debugging

To check logs while running Docker:

```sh
docker-compose logs -f server
```

## Future Plans

- 🔥 **Angular Frontend** – A UI to interact with assistants, tasks, and learning modules.
- 🔄 **Enhanced Caching** – Improve request efficiency with smart caching strategies.
- 🧠 **Expanded Memory Storage** – Store and retrieve deeper contextual data across sessions.
- 📊 **Analytics & Usage Metrics** – Track assistant interactions and effectiveness.

## License

MIT License – Free to use and modify.

## Other stuff:

### Adding functionality guide:

🚀 Steps to Add New Functionality
1️⃣ Create the Core Service (Business Logic)
Go to /services/sqlite-services/ (or appropriate directory).
Create a new [Feature]Service.ts (e.g., TaskService.ts).
Implement methods for DB queries, CRUD operations, etc.
✅ Example:

typescript
Copy
Edit
import { Pool } from 'pg';

export class TaskService {
constructor(private pool: Pool) {}

async getAllTasks() {
const result = await this.pool.query('SELECT \* FROM tasks');
return result.rows;
}
}
2️⃣ Create the Service Controller (Middleware Layer)
Go to /services/core-services/.
Create [Feature]ControllerService.ts (e.g., TaskControllerService.ts).
This will act as a bridge between the DB service and the controller.
✅ Example:

typescript
Copy
Edit
import { Pool } from 'pg';
import { TaskService } from '../sqlite-services/task.service';

export class TaskControllerService {
private taskService: TaskService;

constructor(pool: Pool) {
this.taskService = new TaskService(pool);
}

async getTasks() {
return await this.taskService.getAllTasks();
}
}
3️⃣ Create the Controller (Express API Logic)
Go to /controllers/.
Create [Feature].controller.ts (e.g., task.controller.ts).
This exposes endpoints using the service controller.
✅ Example:

typescript
Copy
Edit
import { Pool } from 'pg';
import { Request, Response } from 'express';
import { TaskControllerService } from '../services/core-services/task.controller.service';
import { respond } from './controller.helper';

export class TaskController {
private readonly taskService: TaskControllerService;

constructor(db: Pool) {
this.taskService = new TaskControllerService(db);
}

async getTasks(req: Request, res: Response) {
try {
const tasks = await this.taskService.getTasks();
if (!tasks.length) return respond(res, 404, 'No tasks found.');
return respond(res, 200, 'Tasks retrieved successfully.', tasks);
} catch (error) {
return respond(res, 500, 'Failed to fetch tasks.', null, error);
}
}
}
4️⃣ Create the Route (Attach to Express Router)
Go to /routes/.
Create [feature].route.ts (e.g., task.route.ts).
This maps HTTP endpoints to controller methods.
✅ Example:

typescript
Copy
Edit
import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new TaskController(db);

router.get('/', async (req, res, next) => {
try {
await controller.getTasks(req, res);
} catch (error) {
next(error);
}
});

export default router;
5️⃣ Register Route in app.ts
Open app.ts (or server.ts).
Import and attach the new route using app.use().
✅ Example:

typescript
Copy
Edit
import express from 'express';
import taskRoutes from './routes/task.route';

const app = express();
app.use('/tasks', taskRoutes);
🎯 Finalized Process (TL;DR)
Create Service in /services/sqlite-services/
Create Service Controller in /services/core-services/
Create Express Controller in /controllers/
Create Route in /routes/
Register Route in app.ts

## tools

add-functionality.ts
makes this process a bit easier, creates files in correct directories with comments and boilerplate to edit
