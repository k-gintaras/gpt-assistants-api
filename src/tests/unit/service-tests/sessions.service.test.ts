import { Pool } from 'pg';
import { getDb } from '../test-db.helper';
import { SessionsService } from '../../../services/sqlite-services/sessions.service';
import { insertHelpers } from '../test-db-insert.helper'; // Assuming helper is there to insert assistant

let db: Pool;
let sessionsService: SessionsService;

beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  sessionsService = new SessionsService(db);
});

beforeEach(async () => {
  await db.query('BEGIN'); // Start transaction for each test

  // Insert a mock assistant to satisfy foreign key constraint
  await insertHelpers.insertAssistant(db, 'assistant123'); // Insert the assistant with a unique ID
});

afterEach(async () => {
  // Clean up after each test
  await db.query('DELETE FROM sessions');
  await db.query('DELETE FROM assistants'); // Clean up assistants table as well to prevent clutter
  await db.query('ROLLBACK'); // Rollback changes after each test
});

afterAll(async () => {
  await getDb.close(); // Close DB connection after all tests
});

describe('SessionsService Tests', () => {
  test('createSession - should create a new session', async () => {
    const assistantId = 'assistant123'; // Mock assistant ID
    const userId = 'user123'; // Mock user ID
    const name = 'Test Session';

    const session = await sessionsService.createSession(assistantId, userId, name);

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.name).toBe(name);

    const rows = await db.query('SELECT * FROM sessions WHERE id = $1', [session.id]);
    expect(rows.rows.length).toBe(1);
    expect(rows.rows[0].name).toBe(name);
  });

  test('getSessionById - should retrieve session by ID', async () => {
    const assistantId = 'assistant123'; // Use the same assistant ID
    const userId = 'user123';
    const name = 'Test Session';

    const session = await sessionsService.createSession(assistantId, userId, name);

    const fetchedSession = await sessionsService.getSessionById(session.id);

    expect(fetchedSession).toBeDefined();
    expect(fetchedSession?.id).toBe(session.id);
    expect(fetchedSession?.name).toBe(name);
  });

  test('updateSession - should update an existing session', async () => {
    const assistantId = 'assistant123'; // Mock assistant ID
    const userId = 'user123';
    const name = 'Test Session';

    const session = await sessionsService.createSession(assistantId, userId, name);
    const updatedSession = await sessionsService.updateSession(session.id, { ended_at: new Date().toISOString() });

    expect(updatedSession).toBeDefined();
    expect(updatedSession?.ended_at).toBeDefined();
  });

  test('deleteSession - should delete an existing session', async () => {
    const assistantId = 'assistant123'; // Mock assistant ID
    const userId = 'user123';
    const name = 'Test Session';

    const session = await sessionsService.createSession(assistantId, userId, name);
    const result = await sessionsService.deleteSession(session.id);

    expect(result).toBe(true);

    const rows = await db.query('SELECT * FROM sessions WHERE id = $1', [session.id]);
    expect(rows.rows.length).toBe(0); // No session should be found
  });
});
