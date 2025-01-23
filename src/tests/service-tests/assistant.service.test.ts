import Database from 'better-sqlite3';
import { assistantService } from '../../services/assistant.service';
import { Assistant } from '../../models/assistant.model';

let db: Database.Database;

describe('Assistant Service Tests', () => {
  beforeEach(() => {
    // Create a new in-memory database for each test
    db = new Database(':memory:');
    assistantService.setDb(db); // Inject the test-specific database instance

    // Initialize the assistants table
    db.exec(`
      CREATE TABLE assistants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('completion', 'chat', 'assistant')) NOT NULL,
        instructions TEXT,
        feedback_positive INTEGER DEFAULT 0,
        feedback_negative INTEGER DEFAULT 0,
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
      type: 'completion',
      instructions: 'Some instructions',
      feedback: {
        positive: 0,
        negative: 0,
      },
    };

    const id = await assistantService.addAssistant(newAssistant);
    const assistant = assistantService.getAssistantById(id);

    expect(assistant).toBeDefined();
    if (!assistant) throw new Error('Assistant not found');
    expect(assistant.name).toBe(newAssistant.name);
    expect(assistant.type).toBe(newAssistant.type);
  });

  test('Should fetch all assistants', () => {
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, instructions, feedback_positive, feedback_negative, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run('1', 'Test Assistant 1', 'A description', 'completion', 'Some instructions', 0, 0, new Date().toISOString(), new Date().toISOString());

    const assistants = assistantService.getAllAssistants();
    expect(assistants).toHaveLength(1);
    expect(assistants[0].name).toBe('Test Assistant 1');
  });

  test('Should fetch an assistant by ID', () => {
    const id = '1';
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, instructions, feedback_positive, feedback_negative, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(id, 'Test Assistant', 'A description', 'completion', 'Some instructions', 0, 0, new Date().toISOString(), new Date().toISOString());

    const assistant = assistantService.getAssistantById(id);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant');
  });

  test('Should update an existing assistant', async () => {
    const id = '1';
    db.prepare(
      `
      INSERT INTO assistants (id, name, description, type, instructions, feedback_positive, feedback_negative, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(id, 'Old Assistant', 'Old description', 'completion', 'Old instructions', 0, 0, new Date().toISOString(), new Date().toISOString());

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
      INSERT INTO assistants (id, name, description, type, instructions, feedback_positive, feedback_negative, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(id, 'Test Assistant', 'Description', 'assistant', 'Instructions', 0, 0, new Date().toISOString(), new Date().toISOString());

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
