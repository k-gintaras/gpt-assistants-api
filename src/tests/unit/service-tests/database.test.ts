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
  const insertAssistant = (id: string, type: string = 'completion') => {
    return db
      .prepare(
        `
      INSERT INTO assistants (id, name, type, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(id, `Assistant ${id}`, type, new Date().toISOString(), new Date().toISOString());
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

  // const insertUser = (id: string) => {
  //   return db
  //     .prepare(
  //       `
  //     INSERT INTO users (id, name, defaultAssistantType, feedbackFrequency, createdAt, updatedAt)
  //     VALUES (?, ?, ?, ?, ?, ?)
  //   `
  //     )
  //     .run(id, `User ${id}`, 'completion', 'sometimes', new Date().toISOString(), new Date().toISOString());
  // };

  describe('Assistants', () => {
    // ! redundant, there is no direct tags
    // test('should handle JSON arrays in tags field', () => {
    //   const tags = JSON.stringify(['tag1', 'tag2']);
    //   const stmt = db.prepare(`
    //     INSERT INTO assistants (id, name, type, tags, createdAt, updatedAt)
    //     VALUES (?, ?, ?, ?, ?, ?)
    //   `);
    //   expect(() => stmt.run('1', 'Test', 'completion', tags, new Date().toISOString(), new Date().toISOString())).not.toThrow();
    //   const result = db.prepare('SELECT tags FROM assistants WHERE id = ?').get('1') as { tags: string };
    //   expect(JSON.parse(result.tags)).toEqual(['tag1', 'tag2']);
    // });
    // test('should track feedback counts correctly', () => {
    //   insertAssistant('1');
    //   const updateFeedback = db.prepare(`
    //     UPDATE assistants
    //     SET feedback_positive = feedback_positive + 1,
    //         feedback_lastFeedbackDate = ?
    //     WHERE id = ?
    //   `);
    //   updateFeedback.run(new Date().toISOString(), '1');
    //   const result = db.prepare('SELECT feedback_positive FROM assistants WHERE id = ?').get('1') as { feedback_positive: number };
    //   expect(result.feedback_positive).toBe(1);
    // });
  });

  describe('Memory Management', () => {
    test('should handle complex memory relationships', () => {
      // Create memories
      insertMemory('m1');
      insertMemory('m2');
      insertMemory('m3');

      // Create relationships
      const relationStmt = db.prepare(`
        INSERT INTO memory_relationships (id, source_memory_id, target_memory_id, relationship_type, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      expect(() => relationStmt.run('r1', 'm1', 'm2', 'related_to', now, now)).not.toThrow();
      expect(() => relationStmt.run('r2', 'm2', 'm3', 'part_of', now, now)).not.toThrow();

      // Query relationships
      const relationships = db
        .prepare(
          `
        SELECT * FROM memory_relationships 
        WHERE source_memory_id = ? OR target_memory_id = ?
      `
        )
        .all('m2', 'm2');

      expect(relationships).toHaveLength(2);
    });

    test('should enforce memory focus rules', () => {
      insertAssistant('a1');

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
      insertAssistant('a1');

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

  // ! redundant, user stuff is basically assistant and task
  // describe('User Queries', () => {
  //   test('should track user queries and results', () => {
  //     insertUser('u1');

  //     const createQuery = db.prepare(`
  //       INSERT INTO queries (id, userId, input, results, createdAt, updatedAt)
  //       VALUES (?, ?, ?, ?, ?, ?)
  //     `);

  //     const results = JSON.stringify(['result1', 'result2']);
  //     const now = new Date().toISOString();

  //     expect(() => createQuery.run('q1', 'u1', 'test query', results, now, now)).not.toThrow();

  //     const query = db.prepare('SELECT * FROM queries WHERE id = ?').get('q1') as { results: string };
  //     expect(JSON.parse(query.results)).toEqual(['result1', 'result2']);
  //   });
  // });

  describe('Tags and Relationships', () => {
    test('should manage entity tagging', () => {
      // Create tags
      const createTag = db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)');
      createTag.run('t1', 'important');
      createTag.run('t2', 'urgent');

      // Create assistant and memory
      insertAssistant('a1');
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
