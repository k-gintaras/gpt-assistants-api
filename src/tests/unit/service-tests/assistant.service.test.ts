import Database from 'better-sqlite3';
import { Assistant } from '../../../models/assistant.model';
import { AssistantService } from '../../../services/sqlite-services/assistant.service';

let db: Database.Database;
let assistantService: AssistantService;

describe('Assistant Service Tests', () => {
  beforeEach(() => {
    // Create a new in-memory database for each test
    db = new Database(':memory:');
    assistantService = new AssistantService(db);

    // Initialize the assistants table
    db.exec(`
      CREATE TABLE assistants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('chat', 'assistant')) NOT NULL,
        model TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  });

  afterEach(() => {
    // Close the database connection after each test
    db.close();
  });

  test('Should add and fetch an assistant', async () => {
    const newAssistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Assistant',
      description: 'A test assistant',
      type: 'chat',
      model: 'gpt-3.5-turbo',
    };

    const id = await assistantService.addAssistant(newAssistant);
    if (!id) return;
    const assistant = assistantService.getAssistantById(id);

    expect(assistant).toBeDefined();
    if (!assistant) throw new Error('Assistant not found');
    expect(assistant.name).toBe(newAssistant.name);
    expect(assistant.type).toBe(newAssistant.type);
    expect(assistant.model).toBe(newAssistant.model);
  });

  test('Should fetch all assistants', () => {
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run('1', 'Test Assistant 1', 'A description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString());

    const assistants = assistantService.getAllAssistants();
    if (!assistants) return;
    expect(assistants).toHaveLength(1);
    expect(assistants[0].name).toBe('Test Assistant 1');
    expect(assistants[0].model).toBe('gpt-3.5-turbo');
  });

  test('Should fetch an assistant by ID', () => {
    const id = '1';
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(id, 'Test Assistant', 'A description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString());

    const assistant = assistantService.getAssistantById(id);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant');
    expect(assistant?.model).toBe('gpt-3.5-turbo');
  });

  test('Should update an existing assistant', async () => {
    const id = '1';
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(id, 'Old Assistant', 'Old description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString());

    const updates = {
      name: 'Updated Assistant',
      description: 'Updated description',
    };

    const success = await assistantService.updateAssistant(id, updates);
    expect(success).toBe(true);

    const assistant = assistantService.getAssistantById(id);
    expect(assistant?.name).toBe(updates.name);
    expect(assistant?.description).toBe(updates.description);
  });

  test('Should delete an assistant by ID', async () => {
    const id = '1';
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(id, 'Test Assistant', 'Description', 'assistant', 'gpt-4', new Date().toISOString(), new Date().toISOString());

    const success = await assistantService.deleteAssistant(id);
    expect(success).toBe(true);

    const assistant = assistantService.getAssistantById(id);
    expect(assistant).toBeNull();
  });

  test('Should handle non-existent assistant for updates', async () => {
    await expect(assistantService.updateAssistant('non-existent-id', { name: 'Updated Name' })).rejects.toThrow('Assistant with ID non-existent-id not found.');
  });

  test('Should handle non-existent assistant for deletion', async () => {
    const success = await assistantService.deleteAssistant('non-existent-id');
    expect(success).toBe(false);
  });
});
