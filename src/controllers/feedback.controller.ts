import { Pool } from 'pg';
import { Request, Response } from 'express';
import { FeedbackControllerService } from '../services/core-services/feedback.controller.service';
import { Feedback } from '../models/feedback.model';
import { respond } from './controller.helper';

export class FeedbackController {
  private readonly feedbackService: FeedbackControllerService;

  constructor(db: Pool) {
    this.feedbackService = new FeedbackControllerService(db);
  }

  /**
   * Retrieve feedback by ID.
   * @requestParams { id: string } The ID of the feedback.
   * @response {200} { status: "success", message: "Feedback with ID {id} fetched successfully", data: Feedback }
   * @response {404} { status: "error", message: "Feedback with ID {id} not found." }
   * @response {500} { status: "error", message: "Failed to retrieve feedback.", error: any }
   */
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

  /**
   * Retrieve feedback by target (e.g., assistant, memory, task).
   * @requestParams { targetId: string, targetType: string } The ID and type of the target (assistant, memory, or task).
   * @response {200} { status: "success", message: "Feedback for {targetType} with ID {targetId} fetched successfully", data: Feedback[] }
   * @response {404} { status: "error", message: "No feedback found for {targetType} with ID {targetId}." }
   * @response {500} { status: "error", message: "Failed to retrieve feedback.", error: any }
   */
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

  /**
   * Add new feedback.
   * @requestBody { message: string, rating: number, targetId: string, targetType: string } The feedback details.
   * @response {201} { status: "success", message: "Feedback added successfully", data: { id: string } }
   * @response {404} { status: "error", message: "Failed to add feedback." }
   * @response {500} { status: "error", message: "Failed to add feedback.", error: any }
   */
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

  /**
   * Update existing feedback.
   * @requestParams { id: string } The ID of the feedback to update.
   * @requestBody { message?: string, rating?: number, targetId?: string, targetType?: string } The fields to update.
   * @response {200} { status: "success", message: "Feedback updated successfully" }
   * @response {404} { status: "error", message: "Feedback with ID {id} not found or update failed." }
   * @response {500} { status: "error", message: "Failed to update feedback.", error: any }
   */
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
      return respond(res, 500, 'Failed to update feedback.', null, error);
    }
  }

  /**
   * Delete feedback.
   * @requestParams { id: string } The ID of the feedback to delete.
   * @response {200} { status: "success", message: "Feedback deleted successfully" }
   * @response {404} { status: "error", message: "Feedback with ID {id} not found or delete failed." }
   * @response {500} { status: "error", message: "Failed to delete feedback.", error: any }
   */
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
