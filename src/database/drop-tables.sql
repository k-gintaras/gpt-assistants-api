-- Drop tables in reverse order (to avoid foreign key errors)
DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS assistant_tags;
DROP TABLE IF EXISTS memory_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS relationship_graph;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS focused_memories;
DROP TABLE IF EXISTS memory_focus_rules;
DROP TABLE IF EXISTS owned_memories;
DROP TABLE IF EXISTS memories;
DROP TABLE IF EXISTS assistants;

-- new addition 0.2 deletion of sessions and chats
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS chat_messages;
