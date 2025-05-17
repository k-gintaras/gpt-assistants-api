import { Router } from 'express';
import { getDb } from '../database/database';
import { SessionsController } from '../controllers/sessions.controller';

const router = Router();
const db = getDb().getInstance();
const controller = new SessionsController(db);

router.post('/', async (req, res, next) => {
  try {
    await controller.createSession(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/', async (req, res, next) => {
  try {
    await controller.getAllSessions(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId', async (req, res, next) => {
  try {
    await controller.getSessionById(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:sessionId', async (req, res, next) => {
  try {
    await controller.updateSession(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:sessionId', async (req, res, next) => {
  try {
    await controller.deleteSession(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
