/*
  Example: programmatic chat using ConversationService
  Usage:
    - Ensure a running Postgres (or set DATABASE_URL to a working Postgres instance).
    - Ensure an assistant with the given ID exists in the DB (see examples/README.md for a SQL snippet).
    - Run: DATABASE_URL=postgres://user:pass@host:5432/dbname ts-node examples/chat.ts

  This script demonstrates using the orchestrator `ConversationService` which handles
  sessions, chats, memories and the AI API call (via configured AiApiService).
*/

import { Pool } from 'pg';
import { ConversationService } from '../src/services/orchestrator-services/conversation/conversation.service';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: Please set DATABASE_URL (e.g. export DATABASE_URL="postgres://user:pass@localhost:5432/db")');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const convo = new ConversationService(pool);

  const assistantId = process.env.EXAMPLE_ASSISTANT_ID || 'test-assistant-id';
  const userId = process.env.EXAMPLE_USER_ID || 'example-user';

  try {
    console.log('Sending prompt to assistant:', assistantId);

    const response = await convo.ask({
      assistantId,
      userId,
      chatId: null,     // set an existing chatId to continue a chat
      sessionId: null,  // set an existing sessionId to reuse session
      prompt: 'Hello! Introduce yourself in one sentence and provide a short tip.'
    });

    console.log('\n--- Assistant response ---');
    console.log('responseType:', response.responseType);
    console.log('answer:', response.answer);
    console.log('chatId:', response.chatId);
    console.log('sessionId:', response.sessionId);

  } catch (err) {
    console.error('Conversation failed:', err);
  } finally {
    await pool.end();
  }
}

main();
