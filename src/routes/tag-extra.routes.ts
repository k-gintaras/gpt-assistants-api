import { Router } from 'express';
import { TagExtraController } from '../controllers/tag-extra.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new TagExtraController(db);

router.get('/:entityType/:entityId', async (req, res, next) => {
  try {
    await controller.getTagsByEntity(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.post('/:entityType/:entityId/:tagId', async (req, res, next) => {
  try {
    await controller.addTagToEntity(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/name/:entityType/:entityId', async (req, res, next) => {
  try {
    await controller.addTagNamesToEntity(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:entityType/:entityId/:tagId', async (req, res, next) => {
  try {
    await controller.removeTagFromEntity(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
