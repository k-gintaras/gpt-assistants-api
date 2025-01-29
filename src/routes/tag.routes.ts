import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { getDbInstance } from '../database/database';

const router = Router();
const db = getDbInstance();
const controller = new TagController(db);

router.post('/', async (req, res, next) => {
  try {
    await controller.addTag(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.delete('/:tagId', async (req, res, next) => {
  try {
    await controller.removeTag(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:tagId', async (req, res, next) => {
  try {
    await controller.updateTag(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:tagId', async (req, res, next) => {
  try {
    await controller.getTagById(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    await controller.getAllTags(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
