import { Pool } from 'pg';
import { Chat } from '../../models/chat.model';
import { ChatsService } from '../sqlite-services/chats.service';

export class ChatsControllerService {
  private chatService: ChatsService;

  constructor(pool: Pool) {
    this.chatService = new ChatsService(pool);
  }

  // Create a new chat in a session
  async createChat(sessionId: string): Promise<Chat> {
    return await this.chatService.createChat(sessionId);
  }

  // Get all chats by session ID
  async getChatsBySessionId(sessionId: string): Promise<Chat[]> {
    return await this.chatService.getChatsBySessionId(sessionId);
  }
}
