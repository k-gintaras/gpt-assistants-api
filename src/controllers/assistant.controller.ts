import { Request, Response } from 'express';
import { Assistant } from '../models/assistant.model';
import { assistantService } from '../services/assistant.service';

export const getAllAssistants = async (_req: Request, res: Response) => {
  try {
    const assistants = assistantService.getAllAssistants();
    res.json(assistants);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createAssistant = async (req: Request, res: Response) => {
  try {
    const assistant: Assistant = req.body;
    const id = assistantService.addAssistant(assistant);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
