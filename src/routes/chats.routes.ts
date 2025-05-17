import { Router } from 'express';
import { ChatsController } from '../controllers/chats.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new ChatsController(db);

router.post('/', async (req, res, next) => {
  try {
    await controller.createChat(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/:sessionId', async (req, res, next) => {
  try {
    await controller.getChatsBySessionId(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
