import { Pool } from 'pg';
import dotenv from 'dotenv';
import { getDb } from './database';

dotenv.config();

async function createDatabaseIfNotExists(dbName: string): Promise<void> {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  });

  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (result.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
    client.release();
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await pool.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isReset = args.includes('--reset');

  const dbName = process.env.DB_NAME || 'gpt_assistants';

  // Create database if it doesn't exist
  await createDatabaseIfNotExists(dbName);

  // Get the database helper
  const db = getDb();
  db.setFeedbackEnabled(true);

  if (isReset) {
    console.log('Performing hard reset: dropping all data and reloading schema...');
    await db.reset();
    console.log('Hard reset completed.');
  } else {
    console.log('Initializing/updating database schema...');
    await db.initialize();
    console.log('Database initialization completed.');
  }

  await db.close();
  console.log('Done.');
}

main().catch(console.error);
