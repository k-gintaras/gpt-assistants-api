import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database;

beforeEach(() => {
  db = new Database(':memory:');
  const sqlFilePath = path.join(__dirname, '../../../database/tables.sql');
  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`SQL file not found at ${sqlFilePath}`);
  }
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  db.exec(sql);
});

afterEach(() => {
  db.close();
});

describe('Advanced Database Schema Tests', () => {
  // Helper functions
  const insertAssistant = (id: string, type: string = 'chat', model: string = 'gpt-3.5-turbo') => {
    return db
      .prepare(
        `
      INSERT INTO assistants (id, name, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(id, `Assistant ${id}`, type, model, new Date().toISOString(), new Date().toISOString());
  };

  const insertMemory = (id: string, type: string = 'knowledge') => {
    return db
      .prepare(
        `
      INSERT INTO memories (id, type, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(id, type, `Memory ${id}`, new Date().toISOString(), new Date().toISOString());
  };

  describe('Memory Management', () => {
    test('should enforce memory focus rules', () => {
      insertAssistant('a1', 'assistant', 'gpt-4');

      const createRule = db.prepare(`
        INSERT INTO memory_focus_rules (id, assistant_id, maxResults, relationshipTypes, priorityTags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const ruleData = {
        id: 'rule1',
        relationshipTypes: JSON.stringify(['related_to', 'part_of']),
        priorityTags: JSON.stringify(['important', 'urgent']),
      };

      expect(() => createRule.run(ruleData.id, 'a1', 5, ruleData.relationshipTypes, ruleData.priorityTags, new Date().toISOString(), new Date().toISOString())).not.toThrow();
    });
  });

  describe('Task Management', () => {
    test('should handle task lifecycle', () => {
      insertAssistant('a1', 'chat', 'gpt-3.5-turbo');

      const createTask = db.prepare(`
        INSERT INTO tasks (id, description, assignedAssistant, status, inputData, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      const taskId = 't1';
      const inputData = JSON.stringify({ query: 'test query' });

      // Create task
      createTask.run(taskId, 'Test task', 'a1', 'pending', inputData, now, now);

      // Update status
      db.prepare(`UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?`).run('in_progress', new Date().toISOString(), taskId);

      // Complete task with output
      const outputData = JSON.stringify({ result: 'test result' });
      db.prepare(
        `
        UPDATE tasks 
        SET status = ?, outputData = ?, updatedAt = ? 
        WHERE id = ?
      `
      ).run('completed', outputData, new Date().toISOString(), taskId);

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as { status: string; outputData: string };
      expect(task.status).toBe('completed');
      expect(JSON.parse(task.outputData)).toEqual({ result: 'test result' });
    });
  });

  describe('Tags and Relationships', () => {
    test('should manage entity tagging', () => {
      // Create tags
      const createTag = db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)');
      createTag.run('t1', 'important');
      createTag.run('t2', 'urgent');

      // Create assistant and memory
      insertAssistant('a1', 'assistant', 'gpt-4');
      insertMemory('m1');

      // Tag assistant
      const tagAssistant = db.prepare('INSERT INTO assistant_tags (assistant_id, tag_id) VALUES (?, ?)');
      expect(() => tagAssistant.run('a1', 't1')).not.toThrow();

      // Tag memory
      const tagMemory = db.prepare('INSERT INTO memory_tags (memory_id, tag_id) VALUES (?, ?)');
      expect(() => tagMemory.run('m1', 't2')).not.toThrow();

      // Query tags
      const assistantTags = db
        .prepare(
          `
        SELECT t.name FROM tags t
        JOIN assistant_tags at ON t.id = at.tag_id
        WHERE at.assistant_id = ?
      `
        )
        .all('a1');

      expect(assistantTags).toHaveLength(1);
      expect((assistantTags[0] as { name: string }).name).toBe('important');
    });
  });
});
