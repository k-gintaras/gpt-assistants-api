import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

if (process.env.NODE_ENV === 'test') {
  db = new Database(':memory:'); // Use an in-memory database for testing
} else {
  const dbPath = path.join(__dirname, '../data/database.sqlite');
  db = new Database(dbPath);
}

export const getDbInstance = (): Database.Database => db;

export default db;
