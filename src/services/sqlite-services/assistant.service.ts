import { Pool } from 'pg';
import { Assistant, AssistantRow } from '../../models/assistant.model';
import { generateUniqueId } from './unique-id.service';

export class AssistantService {
  constructor(private pool: Pool) {}

  getAllAssistants(): Promise<AssistantRow[]> {
    return this.pool.query<AssistantRow>('SELECT * FROM assistants').then((res) => res.rows);
  }

  async getAssistantById(id: string): Promise<AssistantRow | null> {
    return this.pool.query<AssistantRow>('SELECT * FROM assistants WHERE id = $1', [id]).then((res) => res.rows[0] || null);
  }
  getAssistantByName(name: string): Promise<AssistantRow | null> {
    return this.pool.query<AssistantRow>('SELECT * FROM assistants WHERE name = $1', [name]).then((res) => res.rows[0] || null);
  }

  async addAssistant(assistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>, id: string | null = null, gptAssistantId: string | null = null): Promise<string | null> {
    const assistantId = id || generateUniqueId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    try {
      const stmt = `
        INSERT INTO assistants (id, name, description, type, model, gpt_assistant_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await this.pool.query(stmt, [assistantId, assistant.name, assistant.description || '', assistant.type, assistant.model, gptAssistantId || null, createdAt, updatedAt]);
      return assistantId;
    } catch {
      return null;
    }
  }

  async updateAssistant(id: string, updates: Partial<Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const existingAssistant = await this.getAssistantById(id);
    if (!existingAssistant) {
      throw new Error(`Assistant with ID ${id} not found.`);
    }

    const stmt = `
      UPDATE assistants
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        model = COALESCE($4, model),
        gpt_assistant_id = COALESCE($5, gpt_assistant_id),
        updated_at = $6
      WHERE id = $7
    `;

    await this.pool.query(stmt, [updates.name || null, updates.description || null, updates.type || null, updates.model || null, updates.gptAssistantId || null, new Date().toISOString(), id]);

    return true;
  }

  async deleteAssistant(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `
      DELETE FROM assistants
      WHERE id = $1
    `,
      [id]
    );
    if (!result.rowCount) return false;
    return result.rowCount > 0;
  }
}
