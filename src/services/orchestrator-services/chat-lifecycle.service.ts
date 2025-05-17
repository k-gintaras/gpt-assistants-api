import { Pool } from 'pg';

export class ChatLifecycleService {
  constructor(private pool: Pool) {}

  async isChatExpired(chatId: string): Promise<boolean> {
    const res = await this.pool.query(`SELECT created_at FROM chats WHERE id = $1`, [chatId]);
    if (!res.rowCount) return true;

    const createdAt = new Date(res.rows[0].created_at);
    const ageMs = Date.now() - createdAt.getTime();
    return ageMs > 1000 * 60 * 60 * 24; // 1 day
  }
}
