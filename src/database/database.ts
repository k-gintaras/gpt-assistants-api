/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export class DbHelper {
  private dbPool: Pool;
  private sqlDirectory: string;
  private databaseName: string;

  constructor(databaseName: string) {
    this.databaseName = databaseName;
    const options = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: databaseName,
      password: process.env.DB_PASSWORD || 'password',
      port: parseInt(process.env.DB_PORT || '5432', 10),
    };
    this.dbPool = new Pool(options);

    const sqlDir = process.env.NODE_ENV === 'test' ? './' : '../database';
    if (process.env.NODE_ENV !== 'test') console.warn('!!! Beware we are running docker sql directory, so tables might not reset: ' + sqlDir);
    this.sqlDirectory = path.resolve(__dirname, sqlDir);
  }

  // Optionally initialize the DB, if required
  public async initialize(): Promise<void> {
    console.log('Initializing: ' + this.databaseName);
    const client = await this.dbPool.connect();
    try {
      await client.query('BEGIN');
      await this.loadSchema(client); // Loads schema but does not reset data
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error initializing database:', error);
    } finally {
      client.release();
    }
  }

  // Resets the DB state (clears tables, reloads schema)
  public async reset(): Promise<void> {
    const client = await this.dbPool.connect();
    try {
      await client.query('BEGIN');
      await this.clearData(client); // Clear data from all necessary tables
      await this.loadSchema(client); // Reload schema
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error resetting database:', error);
    } finally {
      client.release();
    }
  }

  // Clears data from tables (no schema reset)
  private async clearData(client: any): Promise<void> {
    const tablesToClear = [
      'assistants',
      'tags',
      'tasks',
      'feedback',
      'memories',
      'memory_focus_rules',
      'owned_memories',
      'focused_memories',
      'task_tags',
      'memory_tags',
      'assistant_tags',
      'relationship_graph',
    ];

    for (const table of tablesToClear) {
      await client.query(`DELETE FROM ${table}`);
    }
  }

  // Load schema from file
  private async loadSchema(client: any): Promise<void> {
    const sqlFilePath = path.join(this.sqlDirectory, 'pg-tables.sql');
    console.log('Retrieving: ' + sqlFilePath);
    if (fs.existsSync(sqlFilePath)) {
      const sql = fs.readFileSync(sqlFilePath, 'utf8');
      console.log('Inserting Tables ' + this.databaseName);
      await client.query(sql);
    } else {
      console.warn('Could not find sql: ' + sqlFilePath);
    }
  }

  // Close the DB pool
  public async close(): Promise<void> {
    await this.dbPool.end();
  }

  // Get DB pool instance
  public getInstance(): Pool {
    return this.dbPool;
  }
}

// Singleton instance for DB helper
let dbHelper: DbHelper;
/**
 *
 * @returns db based on NODE_ENV gpt_assistants_test or gpt_assistants
 * @warn please don't forget to getDb().initialize() somewhere in your app to create tables and stuff
 * @warn please just getDb().getInstance() to get db, currently Pool,      await db.query('BEGIN');  await pool.query("lalala")
 */
export const getDb = (): DbHelper => {
  if (!dbHelper) {
    const dbName = process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME || 'gpt_assistants_test' : process.env.DB_NAME || 'gpt_assistants';
    dbHelper = new DbHelper(dbName); // Create a new DbHelper instance
  }
  return dbHelper;
};
