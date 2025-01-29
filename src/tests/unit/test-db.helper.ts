import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

class TestDbHelper {
  private db: Database.Database | null = null;

  /**
   * Initializes the database with the schema from tables.sql.
   */
  public initialize(): Database.Database {
    if (this.db) {
      this.reset(); // Reset if already initialized
    } else {
      this.db = new Database(':memory:'); // In-memory database
      this.loadSchema();
    }
    return this.db;
  }

  public initializeTarget(db: Database.Database) {
    this.resetTarget(db); // Reset if already initialized
  }

  /**
   * Resets the database by dropping all tables and reloading the schema.
   */
  public reset(): void {
    if (!this.db) {
      throw new Error('Database is not initialized.');
    }
    // Drop tables in reverse dependency order
    const dropStatements = [
      'DROP TABLE IF EXISTS queries;',
      'DROP TABLE IF EXISTS users;',
      'DROP TABLE IF EXISTS relationship_graph;',
      'DROP TABLE IF EXISTS promotion_criteria;',
      'DROP TABLE IF EXISTS feedback;',
      'DROP TABLE IF EXISTS tasks;',
      'DROP TABLE IF EXISTS task_tags;',
      'DROP TABLE IF EXISTS assistant_tags;',
      'DROP TABLE IF EXISTS memory_tags;',
      'DROP TABLE IF EXISTS tags;',
      'DROP TABLE IF EXISTS focused_memories;',
      'DROP TABLE IF EXISTS memory_focus_rules;',
      'DROP TABLE IF EXISTS owned_memories;',
      'DROP TABLE IF EXISTS memories;',
      'DROP TABLE IF EXISTS assistants;',
    ];

    dropStatements.forEach((statement) => {
      try {
        this.db?.exec(statement);
      } catch (error) {
        console.error(`Failed to execute statement: ${statement}`, error);
        console.log(error);
      }
    });

    this.loadSchema();
  }
  public resetTarget(db: Database.Database): void {
    // Drop tables in reverse dependency order
    const dropStatements = [
      'DROP TABLE IF EXISTS queries;',
      'DROP TABLE IF EXISTS users;',
      'DROP TABLE IF EXISTS relationship_graph;',
      'DROP TABLE IF EXISTS promotion_criteria;',
      'DROP TABLE IF EXISTS feedback;',
      'DROP TABLE IF EXISTS tasks;',
      'DROP TABLE IF EXISTS task_tags;',
      'DROP TABLE IF EXISTS assistant_tags;',
      'DROP TABLE IF EXISTS memory_tags;',
      'DROP TABLE IF EXISTS tags;',
      'DROP TABLE IF EXISTS focused_memories;',
      'DROP TABLE IF EXISTS memory_focus_rules;',
      'DROP TABLE IF EXISTS owned_memories;',
      'DROP TABLE IF EXISTS memories;',
      'DROP TABLE IF EXISTS assistants;',
    ];

    dropStatements.forEach((statement) => {
      try {
        db?.exec(statement);
      } catch (error) {
        console.error(`Failed to execute statement: ${statement}`, error);
        console.log(error);
      }
    });

    this.loadSchemaOnTarget(db);
  }

  /**
   * Closes the database connection.
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Gets the current database instance.
   */
  public getDb(): Database.Database {
    if (!this.db) {
      throw new Error('Database is not initialized.');
    }
    return this.db;
  }

  /**
   * Loads the schema from tables.sql into the database.
   */
  private loadSchema(): void {
    if (!this.db) {
      throw new Error('Database is not initialized.');
    }
    const sqlFilePath = path.resolve(__dirname, '../../database/tables.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at ${sqlFilePath}`);
    }
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    this.db.exec(sql);
  }

  private loadSchemaOnTarget(db: Database.Database): void {
    const sqlFilePath = path.resolve(__dirname, '../../database/tables.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at ${sqlFilePath}`);
    }
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    db.exec(sql);
  }
}

export const testDbHelper = new TestDbHelper();
