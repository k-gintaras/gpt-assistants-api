import Database from 'better-sqlite3';
import { PromptService } from '../../services/orchestrator-services/prompt.service';
import { insertHelpers } from '../unit/test-db-insert.helper';
import { testDbHelper } from '../unit/test-db.helper';

let db: Database.Database;
let promptService: PromptService;
const testAssistantId = 'asst_7ISKYusMXvzmPq9IDqQVxqFW';
jest.setTimeout(20000); // Set timeout to 20 seconds

beforeEach(() => {
  db = testDbHelper.initialize();
  promptService = new PromptService(db);

  // Insert necessary test data
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertAssistant(db, testAssistantId, true);
  insertHelpers.insertMemories(db); // Inserts memory records with IDs 1, 2
  insertHelpers.insertMemoryFocusRule(db, '1', '1'); // Inserts focus rule for assistant 1
  insertHelpers.insertMemoryFocusRule(db, '2', testAssistantId); // Inserts focus rule for assistant 2

  // Add focused memory associations
  insertHelpers.insertFocusedMemory(db, '1', '1'); // Associates memory 1 with focus rule 1
  insertHelpers.insertFocusedMemory(db, '2', '1'); // Associates memory 1 with focus rule 2
});

afterEach(() => {
  testDbHelper.reset();
});

afterAll(() => {
  testDbHelper.close();
});

describe('PromptService Integration Tests', () => {
  test('prompt - should handle chat-type assistant', async () => {
    const result = await promptService.prompt('1', 'Hello Chat Assistant!');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('prompt - should handle thread-type assistant', async () => {
    const result = await promptService.prompt(testAssistantId, 'Hello Thread Assistant!');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('prompt - should return null for non-existent assistant ID', async () => {
    const result = await promptService.prompt('invalid-id', 'Should return null');
    expect(result).toBeNull();
  });

  test('handleChatPrompt - should use focused memories and extra instruction', async () => {
    const result = await promptService.prompt('1', 'User input', 'Extra system instruction');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('handleAssistantPrompt - should query assistant with focused memories', async () => {
    const result = await promptService.prompt(testAssistantId, 'Thread input');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('handleAssistantPrompt - should include extra instruction if provided', async () => {
    const result = await promptService.prompt(testAssistantId, 'Thread input', 'Thread-specific instruction');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  test('prompt - should return something even if no focused memories are available', async () => {
    // Remove focused memory from assistant
    db.prepare('DELETE FROM focused_memories WHERE memory_id = ?').run('1');
    const result = await promptService.prompt('1', 'Should return null');
    expect(result).not.toBeNull();
  });
});
