import { Router } from 'express';
import { RelationshipGraphController } from '../controllers/relationship-graph.controller';
import { getDbInstance } from '../database/database';

const router = Router();
const db = getDbInstance();
const controller = new RelationshipGraphController(db);

router.get('/', async (req, res, next) => {
  try {
    await controller.getAllRelationships(req, res);
  } catch (error) {
    next(error); // Pass the error to Express error handling
  }
});

router.get('/source/:targetId', async (req, res, next) => {
  try {
    await controller.getRelationshipsBySource(req, res);
  } catch (error) {
    next(error);
  }
});

// New route for getting relationships by source and type
router.get('/source/:targetId/:relationshipType', async (req, res, next) => {
  try {
    await controller.getRelationshipsBySourceAndType(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await controller.addRelationship(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await controller.updateRelationship(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await controller.deleteRelationship(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
