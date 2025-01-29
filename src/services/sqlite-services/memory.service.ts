import { generateUniqueId } from './unique-id.service';
import { Memory, MemoryRow } from '../../models/memory.model';
import Database from 'better-sqlite3';

export class MemoryService {
  db = new Database(':memory:'); // Default database instance

  constructor(newDb: Database.Database) {
    this.setDb(newDb);
  }

  setDb(newDb: Database.Database) {
    this.db = newDb; // Allow overriding the database instance
  }

  // Add a new memory
  addMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = this.db.prepare(`
      INSERT INTO memories (id, type, description, data, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, memory.type, memory.description || null, memory.data || null, createdAt, updatedAt);

    return id;
  }

  // Remove an existing memory
  removeMemory(memoryId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM memories WHERE id = ?');
    const result = stmt.run(memoryId);

    // Return true if one or more rows were deleted, otherwise false
    return result.changes > 0;
  }

  // Update an existing memory
  updateMemory(id: string, updates: Partial<Omit<Memory, 'id' | 'tags' | 'createdAt' | 'updatedAt'>>): boolean {
    const stmt = this.db.prepare(`
    UPDATE memories
    SET
      type = COALESCE(?, type),
      description = COALESCE(?, description),
      data = COALESCE(?, data),
      updatedAt = ?
    WHERE id = ?
  `);

    const result = stmt.run(updates.type || null, updates.description || null, updates.data || null, new Date().toISOString(), id);

    // Return true if one or more rows were affected, otherwise false
    return result.changes > 0;
  }

  // Fetch memory by ID
  getMemoryById(memoryId: string): Memory | null {
    const stmt = this.db.prepare('SELECT * FROM memories WHERE id = ?');
    const result = stmt.get(memoryId) as MemoryRow | undefined;

    if (!result) return null;

    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  // Fetch all memories
  getAllMemories(): Memory[] | null {
    const stmt = this.db.prepare('SELECT * FROM memories');
    const results = stmt.all() as MemoryRow[];
    if (!results) return null;

    return results.map((result) => ({
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    }));
  }
}
