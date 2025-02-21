import { Router } from 'express';
import { MemoryFocusRuleController } from '../controllers/memory-focus-rule.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new MemoryFocusRuleController(db);

router.post('/', async (req, res, next) => {
  try {
    await controller.createMemoryFocusRule(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/:assistantId', async (req, res, next) => {
  try {
    await controller.getMemoryFocusRules(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/rule/:ruleId', async (req, res, next) => {
  try {
    await controller.getMemoryFocusRuleById(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await controller.updateMemoryFocusRule(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await controller.removeMemoryFocusRule(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
