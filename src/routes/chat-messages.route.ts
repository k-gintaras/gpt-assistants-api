import { Router } from 'express';
import { ChatMessagesController } from '../controllers/chat-messages.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new ChatMessagesController(db);

router.post('/', async (req, res, next) => {
  try {
    await controller.addMessage(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/:chatId', async (req, res, next) => {
  try {
    await controller.getMessagesByChatId(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
