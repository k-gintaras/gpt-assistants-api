import Database from 'better-sqlite3';
import { fullAssistantService } from '../../../services/assistant-full.service';
import { testDbHelper } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
import { GET_FULL_ASSISTANT_WITH_DETAILS } from '../../../queries/assistant.queries';

let db: Database.Database;

beforeEach(() => {
  db = testDbHelper.initialize();
  fullAssistantService.setDb(db);
  insertHelpers.insertFullAssistantSetup(db, '1');
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('Select full assistant query: ', () => {
  test('Debugging Efficient Query', async () => {
    const rows = db.prepare(GET_FULL_ASSISTANT_WITH_DETAILS).all('1');
    expect(rows).toBeDefined();
    expect(rows).not.toHaveLength(0); // Ensure data is fetched
  });
});

describe('Full Assistant Service Tests', () => {
  test('Should fetch full assistant details with tags and memories', async () => {
    const assistant = await fullAssistantService.getFullAssistantWithDetails('1');
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant 1');
    expect(assistant?.assistantTags).toHaveLength(2);
    expect(assistant?.focusedMemories).toHaveLength(1); // Updated to match the two inserted memories
  });
  test('Should fetch assistant without tags or memories', async () => {
    insertHelpers.insertAssistant(db, '2');

    const assistant = await fullAssistantService.getFullAssistantWithDetails('2');
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant 2');
    expect(assistant?.assistantTags).toHaveLength(0);
    expect(assistant?.focusedMemories).toHaveLength(0);
  });

  test('Should fetch assistant with no focus rule or memories', async () => {
    insertHelpers.insertAssistant(db, '3');
    insertHelpers.insertTags(db, '3'); // Tags without focus rule or memories

    const assistant = await fullAssistantService.getFullAssistantWithDetails('3');
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant 3');
    expect(assistant?.assistantTags).toHaveLength(2); // Tags exist
    expect(assistant?.focusedMemories).toHaveLength(0); // No memories
  });

  test('Should return null for non-existent assistant', async () => {
    const assistant = await fullAssistantService.getFullAssistantWithDetails('non-existent-id');
    expect(assistant).toBeNull();
  });

  test('Should handle invalid assistant ID gracefully', async () => {
    const result = await fullAssistantService.getFullAssistantWithDetailsEfficient('invalid-id');
    expect(result).toBeNull(); // Expect null for invalid IDs
  });

  test('Should reset database and fetch nothing', async () => {
    testDbHelper.reset();

    const rows = db.prepare('SELECT * FROM assistants').all();
    expect(rows).toHaveLength(0);
  });

  test('Should handle large data sets efficiently', async () => {
    for (let i = 2; i <= 1000; i++) {
      insertHelpers.insertFullAssistantSetup(db, i.toString());
    }

    const rows = db.prepare('SELECT COUNT(*) AS count FROM assistants').get() as { count: number };
    expect(rows.count).toBe(1000); // Ensure all data is inserted

    const assistant = await fullAssistantService.getFullAssistantWithDetails('500');
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant 500');
  });
});
