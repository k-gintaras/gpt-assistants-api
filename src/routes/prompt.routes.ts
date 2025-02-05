import { Router } from 'express';
import { PromptController } from '../controllers/prompt.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new PromptController(db);

router.post('/', async (req, res, next) => {
  try {
    await controller.prompt(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

export default router;
