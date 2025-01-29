import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import { FeedbackControllerService } from '../services/core-services/feedback.controller.service';
import { Feedback } from '../models/feedback.model';
import { respond } from './controller.helper';

export class FeedbackController {
  private readonly feedbackService: FeedbackControllerService;

  constructor(db: Database.Database) {
    this.feedbackService = new FeedbackControllerService(db);
  }

  async getFeedbackById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const feedback = await this.feedbackService.getFeedbackById(id);
      if (!feedback) {
        return respond(res, 404, `Feedback with ID ${id} not found.`);
      }
      return respond(res, 200, `Feedback with ID ${id} fetched successfully`, feedback);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve feedback.', null, error);
    }
  }
  async getFeedbackByTarget(req: Request, res: Response) {
    const { targetId, targetType } = req.params;
    try {
      const feedback = await this.feedbackService.getFeedbackByTarget(targetId, targetType as 'assistant' | 'memory' | 'task');
      if (feedback.length === 0) {
        return respond(res, 404, `No feedback found for ${targetType} with ID ${targetId}.`);
      }
      return respond(res, 200, `Feedback for ${targetType} with ID ${targetId} fetched successfully`, feedback);
    } catch (error) {
      return respond(res, 500, 'Failed to retrieve feedback.', null, error);
    }
  }
  async addFeedback(req: Request, res: Response) {
    const feedback: Feedback = req.body;
    try {
      const feedbackId = await this.feedbackService.addFeedback(feedback);
      if (!feedbackId) {
        return respond(res, 404, 'Failed to add feedback.');
      }
      return respond(res, 201, 'Feedback added successfully.', { id: feedbackId });
    } catch (error) {
      return respond(res, 500, 'Failed to add feedback.', null, error);
    }
  }
  async updateFeedback(req: Request, res: Response) {
    const { id } = req.params;
    const updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>> = req.body;
    try {
      const isUpdated = await this.feedbackService.updateFeedback(id, updates);
      if (!isUpdated) {
        return respond(res, 404, `Feedback with ID ${id} not found or update failed.`);
      }
      return respond(res, 200, 'Feedback updated successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to update feedback.', null, error); // this was message
    }
  }
  async deleteFeedback(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const isDeleted = await this.feedbackService.deleteFeedback(id);
      if (!isDeleted) {
        return respond(res, 404, `Feedback with ID ${id} not found or delete failed.`);
      }
      return respond(res, 200, 'Feedback deleted successfully.');
    } catch (error) {
      return respond(res, 500, 'Failed to delete feedback.', null, error);
    }
  }
}
