import { Pool } from 'pg';
import { Assistant } from '../../../models/assistant.model';
import { getDb } from '../test-db.helper';
import { AssistantService } from '../../../services/sqlite-services/assistant.service';

let db: Pool;
let assistantService: AssistantService;
const aId = 'assistantServiceId';
describe('Assistant Service Tests', () => {
  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
    assistantService = new AssistantService(db);
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

  test('Should add and fetch an assistant', async () => {
    const newAssistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Assistant',
      description: 'A test assistant',
      type: 'chat',
      model: 'gpt-3.5-turbo',
    };

    const id = await assistantService.addAssistant(newAssistant);
    if (!id) return;
    const assistant = await assistantService.getAssistantById(id);

    expect(assistant).toBeDefined();
    if (!assistant) throw new Error('Assistant not found');
    expect(assistant.name).toBe(newAssistant.name);
    expect(assistant.type).toBe(newAssistant.type);
    expect(assistant.model).toBe(newAssistant.model);
  });

  test('Should fetch all assistants', async () => {
    await db.query(
      `
      INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [aId + '1', 'Test Assistant 1', 'A description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString()]
    );

    const assistants = (await assistantService.getAllAssistants()).filter((a) => a.id === aId + '1');
    expect(assistants).toHaveLength(1);
    expect(assistants[0].name).toBe('Test Assistant 1');
    expect(assistants[0].model).toBe('gpt-3.5-turbo');
  });

  test('Should fetch an assistant by ID', async () => {
    const id = aId + '2';
    await db.query(
      `
      INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [id, 'Test Assistant2', 'A description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString()]
    );

    const assistant = await assistantService.getAssistantById(id);
    expect(assistant).toBeDefined();
    expect(assistant?.name).toBe('Test Assistant2');
    expect(assistant?.model).toBe('gpt-3.5-turbo');
  });

  test('Should update an existing assistant', async () => {
    const id = aId + '1';
    await db.query(
      `
      INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [id, 'Old Assistant', 'Old description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString()]
    );

    const updates = {
      name: 'Updated Assistant',
      description: 'Updated description',
    };

    const success = await assistantService.updateAssistant(id, updates);
    expect(success).toBe(true);

    const assistant = await assistantService.getAssistantById(id);
    expect(assistant?.name).toBe(updates.name);
    expect(assistant?.description).toBe(updates.description);
  });

  test('Should delete an assistant by ID', async () => {
    const id = aId + '3';
    await db.query(
      `
      INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [id, 'Test Assistant', 'Description', 'assistant', 'gpt-4', new Date().toISOString(), new Date().toISOString()]
    );

    const success = await assistantService.deleteAssistant(id);
    expect(success).toBe(true);

    const assistant = await assistantService.getAssistantById(id);
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
