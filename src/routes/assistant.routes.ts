import { Router } from 'express';
import { getAllAssistants, createAssistant } from '../controllers/assistant.controller';

const router = Router();

router.get('/', getAllAssistants);
router.post('/', createAssistant);

export default router;
