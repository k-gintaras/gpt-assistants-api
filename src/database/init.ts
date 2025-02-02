import db from './database';
import fs from 'fs';
import path from 'path';

export const initializeDatabase = () => {
  const sqlFilePath = path.join(__dirname, './tables.sql');

  try {
    const sql = fs.readFileSync(sqlFilePath, 'utf8'); // Read SQL file contents
    db.exec(sql); // Execute SQL statements from the file
    console.log('Database initialized successfully.');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error initializing database:', error.message);
    } else {
      console.error('Error initializing database:', error);
    }
  }
};

// initializeDatabase();
