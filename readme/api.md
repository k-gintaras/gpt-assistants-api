# API Reference

The API is fully documented with Swagger. Access at: http://localhost:3000/api-docs

## Key Endpoints

### Assistants
- `GET /assistant` - List all assistants
- `POST /assistant` - Create assistant
- `GET /assistant/:id` - Get assistant by ID
- `PUT /assistant/:id` - Update assistant
- `DELETE /assistant/:id` - Delete assistant

### Memories
- `GET /memory` - List memories
- `POST /memory` - Create memory
- `GET /memory/:id` - Get memory
- `PUT /memory/:id` - Update memory
- `DELETE /memory/:id` - Delete memory

### Conversations
- `POST /conversation/ask` - Process conversation
  - Body: `{ assistantId, userId?, chatId?, sessionId?, prompt }`
  - Returns: Generated response

### Chats & Messages
- `GET /chats` - List chats
- `POST /chats` - Create chat
- `GET /chat-messages` - List messages
- `POST /chat-messages` - Create message

### Tasks
- `GET /task` - List tasks
- `POST /task` - Create task

### Other
- `/feedback`, `/tag`, `/sessions`, `/orchestrator`, etc.

## Authentication
- OpenAI API key required for completions.
- No user auth in API; handle in frontend.

## Response Format
- Success: `{ status: "success", message: "...", data: ... }`
- Error: `{ status: "error", message: "...", error: ... }`

See Swagger for detailed schemas and examples.
