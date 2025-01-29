import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { getDbInstance } from '../database/database';

const router = Router();
const db = getDbInstance();
const controller = new TaskController(db);

router.get('/:taskId', async (req, res, next) => {
  try {
    await controller.getTaskById(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    await controller.getAllTasks(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await controller.addTask(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:taskId', async (req, res, next) => {
  try {
    await controller.updateTask(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:taskId', async (req, res, next) => {
  try {
    await controller.deleteTask(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/status/:status', async (req, res, next) => {
  try {
    await controller.getTasksByStatus(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/assistant/:assistantId', async (req, res, next) => {
  try {
    await controller.getTasksByAssistant(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
