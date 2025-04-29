import { Pool } from 'pg';
import { getDb } from '../test-db.helper';
import { SessionsService } from '../../../services/sqlite-services/sessions.service';

let db: Pool;
let sessionsService: SessionsService;

beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  sessionsService = new SessionsService(db);
});

beforeEach(async () => {
  await db.query('BEGIN'); // Start transaction for each test
});

afterEach(async () => {
  await db.query('DELETE FROM sessions'); // Clean up after each test
  await db.query('ROLLBACK'); // Rollback changes
});

afterAll(async () => {
  await getDb.close();
});

describe('SessionsService Tests', () => {
  test('createSession - should create a new session', async () => {
    const assistantId = 'assistant123';
    const userId = 'user123';
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
    const assistantId = 'assistant123';
    const userId = 'user123';
    const name = 'Test Session';

    const session = await sessionsService.createSession(assistantId, userId, name);

    const fetchedSession = await sessionsService.getSessionById(session.id);

    expect(fetchedSession).toBeDefined();
    expect(fetchedSession?.id).toBe(session.id);
    expect(fetchedSession?.name).toBe(name);
  });

  test('updateSession - should update an existing session', async () => {
    const assistantId = 'assistant123';
    const userId = 'user123';
    const name = 'Test Session';

    const session = await sessionsService.createSession(assistantId, userId, name);
    const updatedSession = await sessionsService.updateSession(session.id, { ended_at: new Date().toISOString() });

    expect(updatedSession).toBeDefined();
    expect(updatedSession?.ended_at).toBeDefined();
  });

  test('deleteSession - should delete an existing session', async () => {
    const assistantId = 'assistant123';
    const userId = 'user123';
    const name = 'Test Session';

    const session = await sessionsService.createSession(assistantId, userId, name);
    const result = await sessionsService.deleteSession(session.id);

    expect(result).toBe(true);

    const rows = await db.query('SELECT * FROM sessions WHERE id = $1', [session.id]);
    expect(rows.rows.length).toBe(0); // No session should be found
  });
});
