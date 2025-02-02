import Database from 'better-sqlite3';
import { TaskRequest } from '../../../models/service-models/orchestrator.service.model';
import { AssistantSuggestionService } from '../../../services/sqlite-services/assistant-suggestion.service';

describe('AssistantSuggestionService', () => {
  let db: Database.Database;
  let service: AssistantSuggestionService;

  beforeEach(() => {
    db = new Database(':memory:');
    // Create required tables
    db.exec(`
      CREATE TABLE memories (
        id TEXT PRIMARY KEY,
        description TEXT
      );
      CREATE TABLE memory_tags (
        memory_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (memory_id, tag_id)
      );
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE assistants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT,
        model TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
      CREATE TABLE owned_memories (
        assistant_id TEXT NOT NULL,
        memory_id TEXT NOT NULL,
        PRIMARY KEY (assistant_id, memory_id)
      );
      CREATE TABLE focused_memories (
        memory_focus_id TEXT NOT NULL,
        memory_id TEXT NOT NULL,
        PRIMARY KEY (memory_focus_id, memory_id)
      );
      CREATE TABLE assistant_tags (
        assistant_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (assistant_id, tag_id)
      );
      CREATE TABLE feedback (
        id TEXT PRIMARY KEY,
        target_id TEXT,
        target_type TEXT,
        rating INTEGER,
        comments TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
    service = new AssistantSuggestionService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('returns suggestion based on memory match', async () => {
    const now = new Date().toISOString();

    // Insert assistantA
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('assistantA', 'Assistant A', 'Expert in databases', 'assistant', 'gpt-4', now, now);

    // Insert a memory that matches task description
    db.prepare(
      `
      INSERT INTO memories (id, description) VALUES (?, ?)
    `
    ).run('memoryA', 'This memory is about databases and SQL');

    // Link memory to assistantA (owned and focused)
    db.prepare(`INSERT INTO owned_memories (assistant_id, memory_id) VALUES (?, ?)`).run('assistantA', 'memoryA');
    db.prepare(`INSERT INTO focused_memories (memory_focus_id, memory_id) VALUES (?, ?)`).run('focus1', 'memoryA');

    // Insert a feedback row for assistantA (rating: 4)
    db.prepare(
      `
      INSERT INTO feedback (id, target_id, target_type, rating, comments, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('fb-1', 'assistantA', 'assistant', 4, 'Good work', now, now);

    const task: TaskRequest = { type: 'test', description: 'databases' };
    const suggestions = await service.suggestAssistants(task);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].assistantId).toBe('assistantA');
    // Expected score = memory_match_count (1) + avg_feedback (4) = 5
    expect(suggestions[0].score).toBeCloseTo(5, 5);
  });

  test('returns suggestion based on tag match when no memory match exists', async () => {
    const now = new Date().toISOString();

    // Insert a tag 'database'
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run('tag1', 'database');

    // Insert assistantB with no memory but with a matching assistant tag
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('assistantB', 'Assistant B', 'Generalist', 'assistant', 'gpt-4', now, now);
    db.prepare(`INSERT INTO assistant_tags (assistant_id, tag_id) VALUES (?, ?)`).run('assistantB', 'tag1');

    // Provide a task that does not match any memory but passes tag "database"
    const task: TaskRequest = { type: 'test', description: 'random' };
    const suggestions = await service.suggestAssistants(task, ['database']);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].assistantId).toBe('assistantB');
    // With no memory and no feedback, score should be 0.
    expect(suggestions[0].score).toBe(0);
  });

  test('returns both suggestions ordered by score when multiple assistants qualify', async () => {
    const now = new Date().toISOString();

    // Insert tag 'database'
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run('tag1', 'database');

    // Assistant A: memory match + feedback
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('assistantA', 'Assistant A', 'Expert in databases', 'assistant', 'gpt-4', now, now);
    db.prepare(`INSERT INTO memories (id, description) VALUES (?, ?)`).run('memoryA', 'This memory is about databases');
    db.prepare(`INSERT INTO owned_memories (assistant_id, memory_id) VALUES (?, ?)`).run('assistantA', 'memoryA');
    db.prepare(`INSERT INTO focused_memories (memory_focus_id, memory_id) VALUES (?, ?)`).run('focus1', 'memoryA');
    db.prepare(
      `
      INSERT INTO feedback (id, target_id, target_type, rating, comments, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('fb-1', 'assistantA', 'assistant', 5, 'Excellent', now, now);

    // Assistant B: tag match only
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('assistantB', 'Assistant B', 'Generalist', 'assistant', 'gpt-4', now, now);
    db.prepare(`INSERT INTO assistant_tags (assistant_id, tag_id) VALUES (?, ?)`).run('assistantB', 'tag1');

    // Task with description "databases" and tag "database"
    const task: TaskRequest = { type: 'test', description: 'databases' };
    const suggestions = await service.suggestAssistants(task, ['database']);
    // Expect both assistants to be returned.
    expect(suggestions.length).toBe(2);
    // Assistant A: memory_match_count = 1, avg_feedback = 5, so score = 6.
    // Assistant B: tag match only, so score = 0.
    expect(suggestions[0].assistantId).toBe('assistantA');
    expect(suggestions[0].score).toBeCloseTo(6, 5);
    expect(suggestions[1].assistantId).toBe('assistantB');
    expect(suggestions[1].score).toBe(0);
  });
});
