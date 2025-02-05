import { Pool } from 'pg';
import { TaskRequest } from '../../../models/service-models/orchestrator.service.model';
import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { AssistantSuggestionService } from '../../../services/sqlite-services/assistant-suggestion.service';

describe('AssistantSuggestionService', () => {
  let db: Pool;
  let service: AssistantSuggestionService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    service = new AssistantSuggestionService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query('BEGIN'); // Start transaction for each test
  });

  afterEach(async () => {
    await db.query('ROLLBACK'); // Rollback changes after each test
  });

  test('returns suggestion based on memory match', async () => {
    await insertHelpers.insertMemory(db, '1', 'shiny databases');
    await insertHelpers.insertAssistant(db, '1');
    await insertHelpers.insertOwnedMemory(db, '1', '1');
    await insertHelpers.insertMemoryFocusRule(db, '1', '1');
    await insertHelpers.insertFocusedMemory(db, '1', '1');
    await insertHelpers.insertFeedback(db, '1', '1');

    const task: TaskRequest = { type: 'test', description: 'databases' };
    const suggestions = await service.suggestAssistants(task);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].assistantId).toBe('1');
    expect(suggestions[0].score > 0).toBe(true);
  });

  test('returns suggestion based on tag match when no memory match exists', async () => {
    const id = 'assistantB';
    await insertHelpers.insertAssistant(db, id);

    await insertHelpers.insertTag(db, '1', 'database');
    await db.query(`INSERT INTO assistant_tags (assistant_id, tag_id) VALUES ($1, $2)`, [id, '1']);

    const task: TaskRequest = { type: 'test', description: 'random' };
    const suggestions = await service.suggestAssistants(task, ['database']);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].assistantId).toBe(id);
    expect(suggestions[0].score).toBe(0);
  });

  test('returns both suggestions ordered by score when multiple assistants qualify', async () => {
    const now = new Date().toISOString();
    const id1 = 'assistantA';
    const id2 = 'assistantB';
    await insertHelpers.insertMemory(db, 'memoryB', 'Another memory about databases');
    await insertHelpers.insertMemory(db, 'memoryA', 'Another memory about databases');

    await insertHelpers.insertAssistant(db, id1);
    await insertHelpers.insertAssistant(db, id2);
    await insertHelpers.insertOwnedMemory(db, id1, 'memoryB');
    await insertHelpers.insertOwnedMemory(db, id2, 'memoryA');
    await insertHelpers.insertMemoryFocusRule(db, '1', id1);
    await insertHelpers.insertMemoryFocusRule(db, '2', id2);
    await insertHelpers.insertFocusedMemory(db, '1', 'memoryB');
    await insertHelpers.insertFocusedMemory(db, '2', 'memoryA');

    await db.query(
      `INSERT INTO feedback (id, target_id, target_type, rating, comments, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['fb-2', 'assistantA', 'assistant', 5, 'Excellent', now, now]
    );

    const task: TaskRequest = { type: 'test', description: 'databases' };
    const suggestions = await service.suggestAssistants(task, ['database']);
    expect(suggestions.length).toBe(2);
    expect(suggestions[0].assistantId).toBe('assistantA');
    expect(suggestions[0].score).toBeCloseTo(6, 5);
    expect(suggestions[1].assistantId).toBe('assistantB');
    expect(suggestions[1].score).toBe(1);
  });
});
