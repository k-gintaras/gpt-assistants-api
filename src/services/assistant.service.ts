import Database from 'better-sqlite3';
import { Assistant, AssistantRow } from '../models/assistant.model';
import { generateUniqueId } from './unique-id.service';

export const assistantService = {
  db: new Database(':memory:'), // Default database instance

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  },
  // Fetch all assistants
  getAllAssistants(): AssistantRow[] {
    const stmt = this.db.prepare('SELECT * FROM assistants');
    return stmt.all() as AssistantRow[];
  },

  // Fetch a single assistant by ID
  getAssistantById(id: string): AssistantRow | null {
    const stmt = this.db.prepare('SELECT * FROM assistants WHERE id = ?');
    const result = stmt.get(id);
    return result ? (result as AssistantRow) : null;
  },

  // Add a new assistant
  async addAssistant(assistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateUniqueId(); // Generate a unique ID for the assistant
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = this.db.prepare(`
      INSERT INTO assistants (id, name, description, type, instructions, feedback_positive, feedback_negative, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      assistant.name,
      assistant.description,
      assistant.type,
      assistant.instructions || null,
      0, // Initial feedback_positive
      0, // Initial feedback_negative
      createdAt,
      updatedAt
    );

    return id;
  },

  // Update an existing assistant
  async updateAssistant(id: string, updates: Partial<Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existingAssistant = this.db.prepare('SELECT * FROM assistants WHERE id = ?').get(id) as AssistantRow | undefined;

    if (!existingAssistant) {
      throw new Error(`Assistant with ID ${id} not found.`);
    }

    const stmt = this.db.prepare(`
      UPDATE assistants
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        instructions = COALESCE(?, instructions),
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.name || null,
      updates.description || null,
      updates.type || null,
      updates.instructions || null,
      new Date().toISOString(), // updatedAt
      id
    );

    return true;
  },

  // Delete an assistant by ID
  async deleteAssistant(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM assistants
      WHERE id = ?
    `);

    const result = stmt.run(id);

    return result.changes > 0; // Returns true if the assistant was deleted
  },
};
