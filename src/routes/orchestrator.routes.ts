import { Router } from 'express';
import { OrchestratorController } from '../controllers/orchestrator.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new OrchestratorController(db);

router.post('/remember', async (req, res, next) => {
  try {
    await controller.remember(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.post('/delegate-task', async (req, res, next) => {
  try {
    await controller.delegateTask(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/connect-assistants', async (req, res, next) => {
  try {
    await controller.connectAssistants(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/connect-entities', async (req, res, next) => {
  try {
    await controller.connectEntities(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/query-knowledge', async (req, res, next) => {
  try {
    await controller.queryKnowledge(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/suggest-assistants', async (req, res, next) => {
  try {
    await controller.suggestAssistants(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/evaluate-performance/:assistantId', async (req, res, next) => {
  try {
    await controller.evaluatePerformance(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
