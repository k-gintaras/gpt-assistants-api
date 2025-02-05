import { Router } from 'express';
import { MemoryController } from '../controllers/memory.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new MemoryController(db);

router.get('/', async (req, res, next) => {
  try {
    await controller.getMemories(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    await controller.getMemory(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await controller.createMemory(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await controller.updateMemory(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await controller.deleteMemory(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
