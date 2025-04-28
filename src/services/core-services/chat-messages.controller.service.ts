import { Pool } from 'pg';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatMessagesService } from '../sqlite-services/chat-messages.service';

export class ChatMessagesControllerService {
  private chatMessagesService: ChatMessagesService;

  constructor(pool: Pool) {
    this.chatMessagesService = new ChatMessagesService(pool);
  }

  // Add a message to a chat
  async addMessage(chatId: string, memoryId: string, type: string): Promise<ChatMessage> {
    return await this.chatMessagesService.addMessage(chatId, memoryId, type);
  }

  // Get all messages for a chat
  async getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
    return await this.chatMessagesService.getMessagesByChatId(chatId);
  }
}
