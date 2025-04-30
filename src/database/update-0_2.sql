-- New Addition version 0.2
-- Session table for tracking user chat sessions for more advanced chat history and context
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  name TEXT, -- session name
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE, -- ID of the assistant
  user_id TEXT, -- ID of the user
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Use TIMESTAMP for date
  ended_at TIMESTAMP
);

-- chats table for each chat in a session
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, -- ID of the session
);

-- chat_messages table for each message in a chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  type TEXT, -- Message type (user or assistant)
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE, -- ID of the memory
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE, -- ID of the chat
);