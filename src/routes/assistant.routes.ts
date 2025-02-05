import { Router } from 'express';
import { AssistantController } from '../controllers/assistant.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new AssistantController(db);

router.get('/', async (req, res, next) => {
  try {
    await controller.getAllAssistants(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    await controller.getAssistantById(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/details/:id', async (req, res, next) => {
  try {
    await controller.getAssistantWithDetailsById(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/simple', async (req, res, next) => {
  try {
    await controller.createAssistantSimple(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await controller.createAssistant(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await controller.updateAssistant(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await controller.deleteAssistant(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
