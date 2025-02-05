import { Pool } from 'pg';
import { PromptService } from '../../services/orchestrator-services/prompt.service';
import { insertHelpers } from '../unit/test-db-insert.helper';
import { getDb } from '../unit/test-db.helper';

let db: Pool;
let promptService: PromptService;
const testAssistantId = 'asst_OLOnDgu5fqoufVx8V76UD1in';
jest.setTimeout(20000); // Set timeout to 20 seconds

const pId = 'promptIntegrationId';
beforeAll(async () => {
  await getDb.initialize(); // Initialize the database, it now returns a promise
  db = getDb.getInstance();
  promptService = new PromptService(db);
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

describe('PromptService Integration Tests', () => {
  test('prompt - should handle chat-type assistant', async () => {
    await insertHelpers.insertAssistant(db, pId + '2');
    const result = await promptService.prompt(pId + '2', 'Hello Chat Assistant!');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('prompt - should handle thread-type assistant', async () => {
    await insertHelpers.insertAssistant(db, testAssistantId, false);
    const result = await promptService.prompt(testAssistantId, 'Hello Thread Assistant!');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('prompt - should return null for non-existent assistant ID', async () => {
    const result = await promptService.prompt('invalid-id', 'Should return null');
    expect(result).toBeNull();
  });

  test('handleChatPrompt - should use focused memories and extra instruction', async () => {
    const aId = pId + '4';
    await insertHelpers.insertAssistant(db, aId, false);
    const result = await promptService.prompt(aId, 'User input', 'Extra system instruction');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('handleAssistantPrompt - should query assistant with focused memories', async () => {
    await insertHelpers.insertAssistant(db, testAssistantId, true);
    await insertHelpers.insertMemory(db, pId + '1', 'weather is good'); // Inserts memory records with IDs 1, 2
    await insertHelpers.insertMemoryFocusRule(db, pId + '2', testAssistantId); // Inserts focus rule for assistant 2
    await insertHelpers.insertFocusedMemory(db, pId + '2', pId + '1'); // Associates memory 1 with focus rule 1
    const result = await promptService.prompt(testAssistantId, 'Thread input');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('handleAssistantPrompt - should include extra instruction if provided', async () => {
    await insertHelpers.insertAssistant(db, testAssistantId, true);
    const result = await promptService.prompt(testAssistantId, 'Thread input', 'Thread-specific instruction');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('prompt - should return something even if no focused memories are available', async () => {
    await insertHelpers.insertAssistant(db, testAssistantId, true);
    const result = await promptService.prompt(testAssistantId, 'Should return something even if no focused memories');
    expect(result).not.toBeNull();
  });
});
