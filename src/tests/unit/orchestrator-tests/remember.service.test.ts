/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import { MemoryRequest } from '../../../models/service-models/orchestrator.service.model';
import { RememberService } from '../../../services/orchestrator-services/remember.service';
import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { FocusedMemoryService } from '../../../services/sqlite-services/focused-memory.service';
const rId = 'rememberServiceId';
describe('RememberService', () => {
  let db: Pool;
  let rememberService: RememberService;
  let focusedService: FocusedMemoryService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    rememberService = new RememberService(db);
    focusedService = new FocusedMemoryService(db);
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    await db.query(`BEGIN`);
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  test('remember stores memory without tags and not focused', async () => {
    const assistantId = rId + 'assistant1';
    const memoryRequest: MemoryRequest = {
      type: 'knowledge',
      text: 'This is a test memory for our assistant. It should be stored properly.',
    };
    await insertHelpers.insertAssistant(db, assistantId);

    const result = await rememberService.remember(assistantId, memoryRequest);
    expect(result).toBe(true);

    const memoryRow: any = await db.query(`SELECT * FROM memories where description like $1`, [`%${'It should be stored'}%`]).then((res) => res.rows[0]);
    expect(memoryRow).toBeDefined();
    expect(memoryRow.type).toBe('knowledge');
    expect(memoryRow.description.length > 0).toBe(true);
    expect(memoryRow.data).toBe(null);

    const ownedRow: any = await db.query(`SELECT * FROM owned_memories WHERE assistant_id = $1`, [assistantId]).then((res) => res.rows[0]);
    expect(ownedRow).toBeDefined();

    const m = await db.query(`select description from memories where id=$1`, [ownedRow.memory_id]).then((res) => res.rows[0]);

    expect(m.description).toBe(memoryRow.description);

    const focusedByAssistant = await focusedService.getLimitedFocusedMemoriesByAssistantId(assistantId);
    const count = focusedByAssistant ? focusedByAssistant.length : 0;
    expect(count).toBe(0);
  });

  test('remember stores memory with tags and marks it as focused', async () => {
    const assistantId = rId + 'assistant2';
    const memoryRequest: MemoryRequest = {
      type: 'knowledge',
      text: 'This is another test memory that will be focused and tagged appropriately.',
    };
    await insertHelpers.insertAssistant(db, assistantId);
    await insertHelpers.insertMemoryFocusRule(db, rId + 'focusRuleId', assistantId);

    const tags = [rId + 'tag1', rId + 'tag2'];

    const result = await rememberService.remember(assistantId, memoryRequest, tags, true);
    expect(result).toBe(true);

    const memoryRow: any = await db.query(`SELECT * FROM memories order by created_at desc`).then((res) => res.rows[0]);
    expect(memoryRow).toBeDefined();
    expect(memoryRow.type).toBe('knowledge');
    expect(memoryRow.data).toBe(null);

    const ownedRow: any = await db.query(`SELECT * FROM owned_memories WHERE assistant_id = $1`, [assistantId]).then((res) => res.rows[0]);
    expect(ownedRow).toBeDefined();

    // const m = await db.query(`select description from memories where id=$1`, [ownedRow.memory_id]).then((res) => res.rows[0]);
    // expect(m.description).toBe(memoryRow.description);

    const focusedRow: any = await db.query(`SELECT * FROM focused_memories WHERE memory_focus_id = $1`, [rId + 'focusRuleId']).then((res) => res.rows[0]);
    expect(focusedRow).toBeDefined();
    // expect(focusedRow.memory_id).toBe(memoryRow.id);

    const tagRows = await db.query(`SELECT * FROM tags`).then((res) => res.rows);
    expect(tagRows.length).toBeGreaterThanOrEqual(2);

    const memoryTagMappings = await db.query(`SELECT * FROM memory_tags WHERE memory_id = $1`, [memoryRow.id]).then((res) => res.rows);
    expect(memoryTagMappings.length).toBe(tags.length);

    for (const tagName of tags) {
      const tag: any = await db.query(`SELECT * FROM tags WHERE name = $1`, [tagName]).then((res) => res.rows[0]);
      expect(tag).toBeDefined();
      const mapping = await db.query(`SELECT * FROM memory_tags WHERE memory_id = $1 AND tag_id = $2`, [memoryRow.id, tag.id]).then((res) => res.rows[0]);
      expect(mapping).toBeDefined();
    }
  });
});
