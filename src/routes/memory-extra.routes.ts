import { Router } from 'express';
import { MemoryExtraController } from '../controllers/memory-extra.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new MemoryExtraController(db);

router.get('/', async (req, res, next) => {
  try {
    await controller.getMemoriesWithTags(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/tags', async (req, res, next) => {
  try {
    await controller.getMemoriesByTags(req, res);
  } catch (error) {
    next(error);
  }
});

// TODO: write test getOrganizedMemories memory extra router
router.get('/memories', async (req, res, next) => {
  try {
    await controller.getOrganizedMemories(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/tags/:memoryId', async (req, res, next) => {
  try {
    await controller.updateMemoryTags(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
