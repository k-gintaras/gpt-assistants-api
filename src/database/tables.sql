-- Assistant tables 
CREATE TABLE IF NOT EXISTS assistants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('completion', 'chat', 'assistant')) NOT NULL,
  instructions TEXT,
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL  -- ISO 8601 formatted date
);


-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('instruction', 'session', 'prompt', 'knowledge', 'meta')) NOT NULL,
  description TEXT,
  data TEXT, -- Optional serialized JSON
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL -- ISO 8601 formatted date
);

-- Memory relationships table
CREATE TABLE IF NOT EXISTS memory_relationships (
  id TEXT PRIMARY KEY,
  source_memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  target_memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK(relationship_type IN ('related_to', 'part_of', 'example_of', 'derived_from')) NOT NULL,
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL -- ISO 8601 formatted date
);

-- Owned memories
CREATE TABLE IF NOT EXISTS owned_memories (
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  PRIMARY KEY (assistant_id, memory_id)
);

-- Memory focus rules
CREATE TABLE IF NOT EXISTS memory_focus_rules (
  id TEXT PRIMARY KEY,
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  maxResults INTEGER NOT NULL,
  relationshipTypes TEXT DEFAULT '[]', -- Initialize as empty JSON array
  priorityTags TEXT DEFAULT '[]', -- Initialize as empty JSON array
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL -- ISO 8601 formatted date
);

-- Focused memories
CREATE TABLE IF NOT EXISTS focused_memories (
  memory_focus_id TEXT NOT NULL REFERENCES memory_focus_rules(id) ON DELETE CASCADE,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_focus_id, memory_id)
);

-- tasks and relationships will help query related assistants, and required sequence too and see how successful they are
-- Tasks tables
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  assignedAssistant TEXT NOT NULL REFERENCES assistants(id) ON DELETE SET NULL, -- Assigned assistant
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')) NOT NULL,
  inputData TEXT, -- Serialized JSON for task input
  outputData TEXT, -- Serialized JSON for task output
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL  -- ISO 8601 formatted date
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL, -- ID of the target entity (assistant, memory, or task)
  target_type TEXT CHECK(target_type IN ('assistant', 'memory', 'task')) NOT NULL, -- Target type
  user_id TEXT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL, -- Optional user ID
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), -- Rating (1-5 stars)
  comments TEXT, -- Optional feedback comments
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL  -- ISO 8601 formatted date
);

-- relationship_graph
CREATE TABLE IF NOT EXISTS relationship_graph (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('assistant', 'memory', 'task')) NOT NULL, -- Entity type
  target_id TEXT NOT NULL, -- Related entity ID
  relationship_type TEXT CHECK(relationship_type IN ('related_to', 'part_of', 'example_of', 'derived_from', 'depends_on', 'blocks', 'subtask_of')) NOT NULL,
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL  -- ISO 8601 formatted date
);

-- tags
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE memory_tags (
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id)
);

CREATE TABLE assistant_tags (
  assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (assistant_id, tag_id)
);

CREATE TABLE task_tags (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ! future maybe, when assistants can promote other assistants to use higher capabilities
-- Promotion tables
-- CREATE TABLE IF NOT EXISTS promotion_criteria (
--   id TEXT PRIMARY KEY,
--   assistant_id TEXT NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
--   positiveFeedbackThreshold INTEGER NOT NULL,
--   tasksCompletedThreshold INTEGER NOT NULL,
--   memoryExpansion BOOLEAN NOT NULL,
--   nextLevel TEXT CHECK(nextLevel IN ('chat', 'assistant')) NOT NULL,
--   createdAt TEXT NOT NULL, -- ISO 8601 formatted date
--   updatedAt TEXT NOT NULL  -- ISO 8601 formatted date
-- );


-- ! reduntant for now, users are assistants really
-- ! redundant for now queries are tasks 
-- -- Users table
-- CREATE TABLE IF NOT EXISTS users (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   defaultAssistantType TEXT CHECK(defaultAssistantType IN ('completion', 'chat', 'assistant')) NOT NULL,
--   feedbackFrequency TEXT CHECK(feedbackFrequency IN ('always', 'sometimes', 'never')) NOT NULL,
--   createdAt TEXT NOT NULL, -- ISO 8601 formatted date
--   updatedAt TEXT NOT NULL  -- ISO 8601 formatted date
-- );

-- -- Queries table
-- CREATE TABLE IF NOT EXISTS queries (
--   id TEXT PRIMARY KEY,
--   userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   tags TEXT, -- Stored as a serialized JSON array
--   input TEXT NOT NULL,
--   context TEXT, -- Optional query context
--   results TEXT, -- Serialized JSON array for result IDs
--   createdAt TEXT NOT NULL, -- ISO 8601 formatted date
--   updatedAt TEXT NOT NULL  -- ISO 8601 formatted date
-- );
