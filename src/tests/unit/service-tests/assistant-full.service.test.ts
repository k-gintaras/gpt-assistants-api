import { Pool } from 'pg';
import { getDb } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { GET_FULL_ASSISTANT_WITH_DETAILS } from '../../../queries/assistant.queries';
import { FullAssistantService } from '../../../services/sqlite-services/assistant-full.service';

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

describe('Full Assistant Service Tests', () => {
  test('Debugging Efficient Query', async () => {
    // Test the query efficiency for fetching full assistant details
    await insertHelpers.insertAssistant(db, '1'); // Insert an assistant
    await insertHelpers.insertTags(db); // Insert related tags
    const result = await db.query(GET_FULL_ASSISTANT_WITH_DETAILS, ['1']); // Fetch assistant details
    expect(result.rows).toBeDefined();
    expect(result.rows).not.toHaveLength(0); // Ensure data is returned
  });

  test('Should fetch full assistant details with tags and memories', async () => {
    // Test that the full assistant details are fetched correctly with associated tags and memories
    await insertHelpers.insertAssistant(db, '1');
    await insertHelpers.insertTags(db);
    await db.query(`
      INSERT INTO assistant_tags (assistant_id, tag_id) 
      VALUES ('1', '1'), ('1', '2')
    `); // Link assistant with tags explicitly
    await insertHelpers.insertMemory(db, '1', 'Memory 1');
    await insertHelpers.insertMemory(db, '2', 'Memory 2');
    await insertHelpers.insertMemory(db, '3', 'Memory 3');
    await insertHelpers.insertMemoryFocusRule(db, '1');
    await insertHelpers.insertFocusedMemory(db, '1', '1');

    const assistant = await fullAssistantService.getFullAssistantWithDetails('1');
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant 1');
    expect(assistant?.assistantTags).toHaveLength(2); // Expect two tags
    expect(assistant?.focusedMemories).toHaveLength(1); // Expect one focused memory
  });

  test('Should fetch assistant without tags or memories', async () => {
    // Test assistant retrieval with no tags or memories
    const aId = '2';
    await insertHelpers.insertAssistant(db, aId);

    const assistant = await fullAssistantService.getFullAssistantWithDetails(aId);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe(`Test Assistant ${aId}`);
    expect(assistant?.assistantTags).toHaveLength(0); // No tags
    expect(assistant?.focusedMemories).toHaveLength(0); // No memories
  });

  test('Should fetch assistant with no focus rule or memories', async () => {
    // Insert an assistant
    const aId = '3';
    await insertHelpers.insertAssistant(db, aId);

    // Insert tags and associate them with the assistant
    await insertHelpers.insertTags(db);
    await db.query(`
      INSERT INTO assistant_tags (assistant_id, tag_id)
      VALUES ('3', '1'), ('3', '2')
    `); // Associate assistant 3 with two tags

    // Fetch the assistant and ensure it has the correct tags
    const assistant = await fullAssistantService.getFullAssistantWithDetails(aId);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe(`Test Assistant ${aId}`);
    expect(assistant?.assistantTags).toHaveLength(2); // Ensure it has 2 tags
    expect(assistant?.focusedMemories).toHaveLength(0); // No focused memories
  });

  test('Should return null for non-existent assistant', async () => {
    // Test for a non-existent assistant, should return null
    const assistant = await fullAssistantService.getFullAssistantWithDetails('non-existent-id');
    expect(assistant).toBeNull();
  });

  test('Should handle invalid assistant ID gracefully', async () => {
    // Test invalid ID handling, should return null
    const result = await fullAssistantService.getFullAssistantWithDetails('invalid-id');
    expect(result).toBeNull();
  });

  // test('Should reset database and fetch nothing', async () => {
  //   !very bad test :DDDDDDDDDDD
  //   // Test that database is reset correctly and returns no assistants
  //   const result = await db.query('SELECT * FROM assistants');
  //   expect(result.rows).toHaveLength(0); // Expect no assistants
  // });

  test('Should handle large data sets efficiently', async () => {
    // Test efficiency with large data sets (inserting 1000 assistants)
    for (let i = 1; i <= 1000; i++) {
      await insertHelpers.insertAssistant(db, i.toString());
    }

    const result = await db.query('SELECT COUNT(*) AS count FROM assistants');
    expect(parseInt(result.rows[0].count) >= 1000).toBe(true); // Check if 1000 assistants are inserted

    const assistant = await fullAssistantService.getFullAssistantWithDetails('500');
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant 500'); // Fetch the assistant with ID 500
  });
});
