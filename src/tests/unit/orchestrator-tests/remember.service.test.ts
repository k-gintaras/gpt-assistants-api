/* eslint-disable @typescript-eslint/no-explicit-any */
import Database from 'better-sqlite3';
import { MemoryRequest } from '../../../models/service-models/orchestrator.service.model';
import { RememberService } from '../../../services/orchestrator-services/remember.service';

describe('RememberService', () => {
  let db: Database.Database;
  let rememberService: RememberService;

  beforeEach(() => {
    db = new Database(':memory:');
    // Create minimal schema required for RememberService operations.
    db.exec(`
      CREATE TABLE memories (
        id TEXT PRIMARY KEY,
        type TEXT CHECK(type IN ('instruction','session','prompt','knowledge','meta')) NOT NULL,
        description TEXT,
        data TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
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
      CREATE TABLE memory_tags (
        memory_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (memory_id, tag_id)
      );
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
    `);
    rememberService = new RememberService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('remember stores memory without tags and not focused', async () => {
    const assistantId = 'assistant1';
    const memoryRequest: MemoryRequest = {
      type: 'knowledge',
      data: 'This is a test memory for our assistant. It should be stored properly.',
    };

    const result = await rememberService.remember(assistantId, memoryRequest);
    expect(result).toBe(true);

    // Verify a memory was inserted
    const memoryRow: any = db.prepare(`SELECT * FROM memories`).get();
    expect(memoryRow).toBeDefined();
    expect(memoryRow.type).toBe('knowledge');
    // Description is truncated to 50 characters
    expect(memoryRow.description.length).toBeLessThanOrEqual(50);
    expect(memoryRow.data).toBe(memoryRequest.data);

    // Verify owned memory linking
    const ownedRow: any = db.prepare(`SELECT * FROM owned_memories WHERE assistant_id = ?`).get(assistantId);
    expect(ownedRow).toBeDefined();
    expect(ownedRow.memory_id).toBe(memoryRow.id);

    // Since isFocused is false, there should be no focused memory row for the assistant.
    const focusedCount: any = db.prepare(`SELECT COUNT(*) AS count FROM focused_memories`).get();
    expect(focusedCount.count).toBe(0);

    // No tags provided, so memory_tags should be empty.
    const tagCount: any = db.prepare(`SELECT COUNT(*) AS count FROM memory_tags`).get();
    expect(tagCount.count).toBe(0);
  });

  test('remember stores memory with tags and marks it as focused', async () => {
    const assistantId = 'assistant1';
    const memoryRequest: MemoryRequest = {
      type: 'knowledge',
      data: 'This is another test memory that will be focused and tagged appropriately.',
    };
    const tags = ['tag1', 'tag2'];

    const result = await rememberService.remember(assistantId, memoryRequest, tags, true);
    expect(result).toBe(true);

    // Verify memory insertion
    const memoryRow: any = db.prepare(`SELECT * FROM memories`).get();
    expect(memoryRow).toBeDefined();
    expect(memoryRow.type).toBe('knowledge');
    expect(memoryRow.data).toBe(memoryRequest.data);

    // Verify owned memory linking
    const ownedRow: any = db.prepare(`SELECT * FROM owned_memories WHERE assistant_id = ?`).get(assistantId);
    expect(ownedRow).toBeDefined();
    expect(ownedRow.memory_id).toBe(memoryRow.id);

    // Verify focused memory linking (using assistantId as the focus identifier)
    const focusedRow: any = db.prepare(`SELECT * FROM focused_memories WHERE memory_focus_id = ?`).get(assistantId);
    expect(focusedRow).toBeDefined();
    expect(focusedRow.memory_id).toBe(memoryRow.id);

    // Verify tags: each provided tag should exist in the tags table and be linked in memory_tags.
    const tagRows = db.prepare(`SELECT * FROM tags`).all();
    expect(tagRows.length).toBeGreaterThanOrEqual(2);

    const memoryTagMappings = db.prepare(`SELECT * FROM memory_tags WHERE memory_id = ?`).all(memoryRow.id);
    expect(memoryTagMappings.length).toBe(tags.length);

    for (const tagName of tags) {
      const tag: any = db.prepare(`SELECT * FROM tags WHERE name = ?`).get(tagName);
      expect(tag).toBeDefined();
      const mapping = db.prepare(`SELECT * FROM memory_tags WHERE memory_id = ? AND tag_id = ?`).get(memoryRow.id, tag.id);
      expect(mapping).toBeDefined();
    }
  });
});
