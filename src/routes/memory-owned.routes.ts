import { Router } from 'express';
import { OwnedMemoryController } from '../controllers/memory-owned.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new OwnedMemoryController(db);

router.get('/assistant/:assistantId', async (req, res, next) => {
  try {
    await controller.getMemoriesByAssistantId(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/:assistantId', async (req, res, next) => {
  try {
    await controller.getOwnedMemories(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:assistantId/:memoryId', async (req, res, next) => {
  try {
    await controller.addOwnedMemory(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:assistantId/:memoryId', async (req, res, next) => {
  try {
    await controller.removeOwnedMemory(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:assistantId', async (req, res, next) => {
  try {
    await controller.updateOwnedMemories(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
