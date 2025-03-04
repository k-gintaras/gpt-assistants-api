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

-- Owned memories
CREATE TABLE IF NOT EXISTS owned_memories (
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  PRIMARY KEY (assistant_id, memory_id)
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

-- Focused memories
CREATE TABLE IF NOT EXISTS focused_memories (
  memory_focus_id TEXT NOT NULL REFERENCES memory_focus_rules(id) ON DELETE CASCADE,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_focus_id, memory_id)
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
