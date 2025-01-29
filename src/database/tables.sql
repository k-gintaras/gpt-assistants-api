-- Assistant tables 
CREATE TABLE IF NOT EXISTS assistants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('chat', 'assistant')) NOT NULL,
  model TEXT NOT NULL, -- Specifies the GPT model
  createdAt TEXT NOT NULL, -- ISO 8601 formatted date
  updatedAt TEXT NOT NULL -- ISO 8601 formatted date
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

-- TODO: implement this later, easier search... create sql to drop all this.. to reset db
-- Improve search: 
-- CREATE VIEW entity_tags AS
-- SELECT 'assistant' AS entity_type, assistant_id AS entity_id, tag_id
-- FROM assistant_tags
-- UNION ALL
-- SELECT 'memory' AS entity_type, memory_id AS entity_id, tag_id
-- FROM memory_tags
-- UNION ALL
-- SELECT 'task' AS entity_type, task_id AS entity_id, tag_id
-- FROM task_tags;

-- -- easher to get focused memories
-- CREATE VIEW focused_memory_details AS
-- SELECT 
--   fm.memory_focus_id,
--   fm.memory_id,
--   m.type AS memory_type,
--   m.description AS memory_description,
--   m.data AS memory_data,
--   m.createdAt AS memory_created_at,
--   m.updatedAt AS memory_updated_at,
--   r.relationship_type,
--   r.source_memory_id,
--   r.target_memory_id
-- FROM focused_memories fm
-- JOIN memories m ON fm.memory_id = m.id
-- LEFT JOIN memory_relationships r ON r.source_memory_id = m.id;

-- -- search memories
-- CREATE VIRTUAL TABLE memories_fts USING fts5(description, data);
-- INSERT INTO memories_fts(rowid, description, data)
-- SELECT id, description, data FROM memories;



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

