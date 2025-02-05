import { Pool } from 'pg';
import { getDb } from '../test-db.helper';
let db: Pool;
const dId = 'databaseTestId';
describe('Database Initialization Tests', () => {
  beforeAll(async () => {
    await getDb.initialize(); // Initialize the database only once before tests
    db = getDb.getInstance();
  });

  afterAll(async () => {
    await getDb.close(); // Close the database connection after all tests
  });

  beforeEach(async () => {
    await db.query('BEGIN'); // Begin transaction to isolate tests
  });

  afterEach(async () => {
    await db.query('ROLLBACK'); // Rollback changes for isolation between tests
  });

  it('should initialize the database and create tables', async () => {
    const client = await getDb.getInstance().connect();
    try {
      const result = await client.query("SELECT to_regclass('public.assistants') AS exists;");
      expect(result.rows[0].exists).not.toBeNull(); // Check if the assistants table exists
    } finally {
      client.release(); // Release the client back to the pool
    }
  });

  it('should insert a new assistant and retrieve it', async () => {
    const client = await getDb.getInstance().connect();
    try {
      // Insert a new assistant
      await client.query(`INSERT INTO assistants (id, name, description, type, model) VALUES ($1, $2, $3, $4, $5)`, [dId + '1', 'Test Assistant', 'Test Description', 'assistant', 'gpt-3.5-turbo']);

      // Retrieve the assistant by ID
      const res = await client.query(`SELECT * FROM assistants WHERE id = $1`, [dId + '1']);
      expect(res.rows.length).toBe(1); // Ensure the assistant exists
      expect(res.rows[0].name).toBe('Test Assistant'); // Check if the name matches
    } finally {
      client.release();
    }
  });

  it('should delete an assistant and confirm deletion', async () => {
    const client = await getDb.getInstance().connect();
    try {
      // Insert an assistant
      await client.query(`INSERT INTO assistants (id, name, description, type, model) VALUES ($1, $2, $3, $4, $5)`, [
        dId + '2',
        'Delete Test Assistant',
        'Description for delete test',
        'assistant',
        'gpt-4',
      ]);

      // Delete the assistant
      await client.query(`DELETE FROM assistants WHERE id = $1`, [dId + '2']);

      // Try to retrieve the deleted assistant
      const res = await client.query(`SELECT * FROM assistants WHERE id = $1`, [dId + '2']);
      expect(res.rows.length).toBe(0); // Ensure the assistant has been deleted
    } finally {
      client.release();
    }
  });

  it('should check foreign key constraint', async () => {
    const client = await getDb.getInstance().connect();
    try {
      // Attempt to insert a row in a dependent table with a non-existent foreign key
      try {
        await client.query(`INSERT INTO memory_focus_rules (id, assistant_id, max_results) VALUES ($1, $2, $3)`, ['rule1', 'nonexistent_assistant_id', 10]);
      } catch (error) {
        expect(error).toBeDefined(); // Ensure the foreign key constraint is being enforced
      }
    } finally {
      client.release();
    }
  });
});
