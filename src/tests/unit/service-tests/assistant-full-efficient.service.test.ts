import { Pool } from 'pg';
import { FullAssistantService } from '../../../services/sqlite-services/assistant-full.service';
import { insertHelpers } from '../test-db-insert.helper';
import { getDb } from '../test-db.helper';

let db: Pool;
let fullAssistantService: FullAssistantService;
beforeAll(async () => {
  // Initialize database connection and the full assistant service before any tests
  await getDb.initialize();
  db = getDb.getInstance();
  fullAssistantService = new FullAssistantService(db);
});

afterAll(async () => {
  // Close the database connection after all tests
  await getDb.close();
});

beforeEach(async () => {
  // Start a transaction before each test to ensure isolated tests
  await db.query('BEGIN');
});

afterEach(async () => {
  // Rollback any changes made during the test to maintain a clean state
  await db.query('ROLLBACK');
});

describe('Full Assistant EFFICIENT Service Tests', () => {
  test('Should fetch fullest of them all assistant details with tags and memories (efficient)', async () => {
    const aid = 'fullEfficientAssistant7';
    await fullPreInsert(aid, true, true, true);

    const assistant = await fullAssistantService.getFullAssistantWithDetailsEfficient(aid);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant ' + aid);
    expect(assistant?.assistantTags).toHaveLength(2); // Expect two tags
    expect(assistant?.focusedMemories).toHaveLength(2); // Expect two focused memory
    expect(assistant?.feedbackSummary.avgRating).toBe(5); // Expect 0 if no feedback exists
  });
  test('Should fetch fullest of them all assistant details with tags and memories (efficient)', async () => {
    const aid = 'fullEfficientAssistant6';
    await fullPreInsert(aid, true, true, false);

    const assistant = await fullAssistantService.getFullAssistantWithDetailsEfficient(aid);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant ' + aid);
    expect(assistant?.assistantTags).toHaveLength(2); // Expect two tags
    expect(assistant?.focusedMemories).toHaveLength(2); // Expect two focused memory
    expect(assistant?.feedbackSummary.avgRating).toBe(0); // Expect 0 if no feedback exists
  });
  test('Should fetch fullest of them all assistant details with nothing', async () => {
    const aid = 'fullEfficientAssistant5';
    await fullPreInsert(aid, false, false, false);

    const assistant = await fullAssistantService.getFullAssistantWithDetailsEfficient(aid);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant ' + aid);
    expect(assistant?.assistantTags).toHaveLength(0); // Expect two tags
    expect(assistant?.focusedMemories).toHaveLength(0); // Expect two focused memory
    expect(assistant?.feedbackSummary.avgRating).toBe(0); // Expect 0 if no feedback exists
  });
});

async function fullPreInsert(id: string, tags: boolean, memories: boolean, feedback: boolean) {
  const assistantId = id;
  const ruleId = 'rule' + assistantId + 1;
  const mId = 'mem' + assistantId;
  await insertHelpers.insertAssistant(db, assistantId);
  if (tags) {
    await insertHelpers.insertTags(db);
    await db.query(`
      INSERT INTO assistant_tags (assistant_id, tag_id) 
      VALUES ('${assistantId}', '1'), ('${assistantId}', '2')
    `); // Link assistant with tags explicitly
  }

  if (memories) {
    await insertHelpers.insertMemory(db, mId + '1', 'Memory 1');
    await insertHelpers.insertMemory(db, mId + '2', 'Memory 2');
    await insertHelpers.insertMemory(db, mId + '3', 'Memory 3');

    await insertHelpers.insertMemoryFocusRule(db, ruleId, assistantId);
    await insertHelpers.insertFocusedMemory(db, ruleId, mId + '1');
    await insertHelpers.insertFocusedMemory(db, ruleId, mId + '2');
    if (tags) {
      await db.query(`
      INSERT INTO memory_tags (memory_id, tag_id) 
      VALUES ('${mId + '1'}', '1'), ('${mId + '1'}', '2')
    `); // Link assistant with tags explicitly
    }
  }

  if (feedback) {
    await insertHelpers.insertFeedback(db, assistantId + ' Feedback', assistantId);
  }
}
