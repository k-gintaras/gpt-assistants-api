import { Pool } from 'pg';
import { Feedback } from '../../models/feedback.model';
import { FeedbackServiceModel } from '../../models/service-models/feedback.service.model';
import { FeedbackService } from '../sqlite-services/feedback.service';

export class FeedbackControllerService implements FeedbackServiceModel {
  feedbackService: FeedbackService;

  constructor(pool: Pool) {
    this.feedbackService = new FeedbackService(pool);
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    return await this.feedbackService.getFeedbackById(id);
  }

  async getFeedbackByTarget(targetId: string, targetType: 'assistant' | 'memory' | 'task'): Promise<Feedback[]> {
    return await this.feedbackService.getFeedbackByTarget(targetId, targetType);
  }

  async addFeedback(feedback: Omit<Feedback, 'id'>): Promise<string> {
    return await this.feedbackService.addFeedback(feedback);
  }

  async updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    return await this.feedbackService.updateFeedback(id, updates);
  }

  async deleteFeedback(id: string): Promise<boolean> {
    return await this.feedbackService.deleteFeedback(id);
  }
}
