import { Router } from 'express';
import { AssistantMemoryController } from '../controllers/assistant-memory.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new AssistantMemoryController(db);

/**
 * Route to get all categorized memories for an assistant.
 * @route GET /assistants/:id/memories
 */
router.get('/:id/memories', async (req, res, next) => {
  try {
    await controller.getAssistantMemories(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

export default router;
