import { Router } from 'express';
import { FocusedMemoryController } from '../controllers/memory-focused.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new FocusedMemoryController(db);

router.get('/assistant/:assistantId', async (req, res, next) => {
  try {
    await controller.getFocusedMemoriesByAssistantId(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/:memoryFocusId', async (req, res, next) => {
  try {
    await controller.getFocusedMemories(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:memoryFocusId/:memoryId', async (req, res, next) => {
  try {
    await controller.addFocusedMemory(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:memoryFocusId/:memoryId', async (req, res, next) => {
  try {
    await controller.removeFocusedMemory(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:memoryFocusId', async (req, res, next) => {
  try {
    await controller.updateFocusedMemories(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
