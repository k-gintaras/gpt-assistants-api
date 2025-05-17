import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new ConversationController(db);

// POST /conversation/ask
router.post('/ask', async (req, res, next) => {
  try {
    await controller.ask(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
