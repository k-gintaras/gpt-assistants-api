-- SET deadlock_timeout = '1s';  -- This will give more details on where deadlocks are occurring

-- Assistant tables 
CREATE TABLE IF NOT EXISTS assistants (
  id TEXT PRIMARY KEY,
  gpt_assistant_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  model TEXT NOT NULL, -- Specifies the GPT model
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Use TIMESTAMP for date
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  data JSONB, -- Use JSONB for optional serialized JSON
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- Use TIMESTAMP for date
);

-- Memory focus rules, 1 rule per assistant
CREATE TABLE IF NOT EXISTS memory_focus_rules (
  id TEXT PRIMARY KEY,
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  max_results INTEGER NOT NULL,
  relationship_types JSONB DEFAULT '[]', -- Use JSONB for empty array
  priority_tags JSONB DEFAULT '[]', -- Use JSONB for empty array
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  CONSTRAINT unique_assistant_rule UNIQUE (assistant_id) -- Enforce only one rule per assistant
);

-- Focused memories, this is for future use, hot swap memories and more advanced memory usage
-- currently this is called with prompt service to get assistant memories but you can use owned memories with type="whatever" for most cases
-- An assistant can quickly shift between different sets of focused memories without changing ownership. 
CREATE TABLE IF NOT EXISTS focused_memories (
  memory_focus_id TEXT NOT NULL REFERENCES memory_focus_rules(id) ON DELETE CASCADE,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_focus_id, memory_id)
);

-- Owned memories, simply use this for most cases even with memory rules
-- for simplicity sake you can just have type= instruction|focus|whatever and then add to prompt
CREATE TABLE IF NOT EXISTS owned_memories (
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  PRIMARY KEY (assistant_id, memory_id)
);

-- Tasks tables
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  assigned_assistant TEXT NOT NULL REFERENCES assistants(id) ON DELETE SET NULL, -- Assigned assistant
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')) NOT NULL,
  input_data JSONB, -- Serialized JSON for task input (use JSONB)
  output_data JSONB, -- Serialized JSON for task output (use JSONB)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Use TIMESTAMP for date
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL, -- ID of the target entity (assistant, memory, or task)
  target_type TEXT CHECK(target_type IN ('assistant', 'memory', 'task')) NOT NULL, -- Target type
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), -- Rating (1-5 stars)
  comments TEXT, -- Optional feedback comments
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Use TIMESTAMP for date
);

-- Relationship graph
CREATE TABLE IF NOT EXISTS relationship_graph (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('assistant', 'memory', 'task')) NOT NULL, -- Entity type
  target_id TEXT NOT NULL, -- Related entity ID
  relationship_type TEXT CHECK(relationship_type IN ('related_to', 'part_of', 'example_of', 'derived_from', 'depends_on', 'blocks', 'subtask_of')) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Use TIMESTAMP for date
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Memory tags
CREATE TABLE IF NOT EXISTS memory_tags (
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id)
);

-- Assistant tags
CREATE TABLE IF NOT EXISTS assistant_tags (
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (assistant_id, tag_id)
);

-- Task tags
CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- New Addition version 0.2
-- Session table for tracking user chat sessions for more advanced chat history and context
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  name TEXT, -- session name
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE, -- ID of the assistant
  user_id TEXT, -- ID of the user
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Use TIMESTAMP for date
  ended_at TIMESTAMP
);

-- chats table for each chat in a session
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE -- ID of the session
);

-- chat_messages table for each message in a chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  type TEXT, -- Message type (user or assistant)
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE, -- ID of the memory
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Use TIMESTAMP for date
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE -- ID of the chat
);
