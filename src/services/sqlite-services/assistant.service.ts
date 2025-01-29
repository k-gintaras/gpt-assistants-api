import Database from 'better-sqlite3';
import { Assistant, AssistantRow } from '../../models/assistant.model';
import { generateUniqueId } from './unique-id.service';

export class AssistantService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  // Fetch all assistants
  getAllAssistants(): AssistantRow[] | null {
    const stmt = this.db.prepare('SELECT * FROM assistants');
    const result = stmt.all();

    return result ? (result as AssistantRow[]) : null;
  }

  // Fetch a single assistant by ID
  getAssistantById(id: string): AssistantRow | null {
    const stmt = this.db.prepare('SELECT * FROM assistants WHERE id = ?');
    const result = stmt.get(id);
    return result ? (result as AssistantRow) : null;
  }

  // Fetch a single assistant by ID
  getAssistantByName(name: string): AssistantRow | null {
    const stmt = this.db.prepare('SELECT * FROM assistants WHERE name = ?');
    const result = stmt.get(name);
    return result ? (result as AssistantRow) : null;
  }

  // Add a new assistant
  addAssistant(
    assistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>,
    id: string | null = null // Accepts GPT Assistant ID or generates one
  ): string | null {
    const assistantId = id || generateUniqueId(); // Use provided ID or generate a new one
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    try {
      const stmt = this.db.prepare(`
      INSERT INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

      // Execute the prepared statement
      stmt.run(assistantId, assistant.name, assistant.description || '', assistant.type, assistant.model, createdAt, updatedAt);

      return assistantId; // Return the generated ID or the provided one
    } catch {
      return null;
    }
  }

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
        model = COALESCE(?, model),
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.name || null,
      updates.description || null,
      updates.type || null,
      updates.model || null,
      new Date().toISOString(), // updatedAt
      id
    );

    return true;
  }

  // Delete an assistant by ID
  async deleteAssistant(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM assistants
      WHERE id = ?
    `);

    const result = stmt.run(id);

    return result.changes > 0; // Returns true if the assistant was deleted
  }
}
