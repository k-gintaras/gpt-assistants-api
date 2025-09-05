# Features

The GPT Assistants API provides tools for AI-driven applications, focusing on assistants, memories, and interactive conversations.

## Core Features

### Assistants
- **Create and Manage**: CRUD operations for AI assistants.
- **Types**:
  - Regular Assistants: Use instructions and focused memories.
  - Chat Assistants: Treat memories as conversation context.
- **Integration**: Connect to OpenAI for completions.

### Memories
- **Storage**: Persistent knowledge base.
- **Types**: General, focused, owned.
- **Rules**: Focus rules to filter memories per assistant.
- **Usage**: Provide context for prompts.

### Tasks
- **Management**: Create, assign, track tasks.
- **Tagging**: Associate tags with tasks.

### Conversations
- **Latest Feature**: Process user prompts in real-time.
- **Components**:
  - Sessions: Group chats.
  - Chats: Conversation threads.
  - Messages: User/assistant exchanges.
- **API**: POST /conversation/ask with assistantId, prompt, etc.
- **Integration**: Uses memories for context, calls OpenAI.

### Other Features
- **Feedback**: Collect user feedback.
- **Tags**: Categorize items.
- **Relationship Graph**: Visualize connections.
- **Orchestrator**: Coordinate complex workflows.
- **Backup**: Export/import data.

## AI Integration
- OpenAI GPT for completions.
- Supports API keys and project keys.
- Handles retries and errors.

## Extensibility
- Modular architecture for adding new features.
- Use `npm run add` for scaffolding.
