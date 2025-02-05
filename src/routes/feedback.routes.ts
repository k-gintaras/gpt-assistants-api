import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new FeedbackController(db);

router.get('/:id', async (req, res, next) => {
  try {
    await controller.getFeedbackById(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/target/:targetId/:targetType', async (req, res, next) => {
  try {
    await controller.getFeedbackByTarget(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await controller.addFeedback(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await controller.updateFeedback(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await controller.deleteFeedback(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
